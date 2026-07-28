from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    email = Column(String(255), unique=True, index=True)
    password = Column(String(256))
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String(36), primary_key=True, index=True)  # UUID
    student_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    student_name = Column(String(200))
    course_name = Column(String(200))
    cert_type = Column(String(50), default="certificate")
    data_payload = Column(JSON)
    signature = Column(Text)
    organization = Column(String(200), default="EduCerts Academy")
    claim_pin = Column(String(6), nullable=True)
    claimed = Column(Boolean, default=False)
    issued_at = Column(DateTime(timezone=True), server_default=func.now())
    revoked = Column(Boolean, default=False)
    batch_id = Column(String(36), ForeignKey("document_registry.id"), nullable=True)

    # ── Template & PDF fields ──
    template_type = Column(String(10), default="html")  # "html" or "pdf"
    rendered_pdf_path = Column(String(500), nullable=True)  # path to the generated PDF file

    # ── Digital Signing fields ──
    signing_status = Column(String(20), default="unsigned")  # "unsigned" | "signed"
    digital_signatures = Column(JSON, nullable=True)  # list of {signer_name, role, applied_at}

    # ── Content Hash for tamper detection ──
    content_hash = Column(String(64), nullable=True, index=True)  # SHA-256 hash of PDF content

    student = relationship("User", back_populates="certificates")
    batch = relationship("DocumentRegistry", back_populates="certificates")

User.certificates = relationship("Certificate", back_populates="student")


class DocumentRegistry(Base):
    """
    Simulates an OpenAttestation Document Store smart contract.
    """
    __tablename__ = "document_registry"

    id = Column(String(36), primary_key=True, index=True)
    merkle_root = Column(String(64), unique=True, index=True)
    issuer_name = Column(String(200))
    organization = Column(String(200))
    cert_count = Column(Integer, default=1)
    anchored_at = Column(DateTime(timezone=True), server_default=func.now())
    revoked = Column(Boolean, default=False)

    certificates = relationship("Certificate", back_populates="batch")


class DigitalSignatureRecord(Base):
    """
    Stores the signature and stamp images uploaded by an authorized signer.
    """
    __tablename__ = "digital_signature_records"

    id = Column(Integer, primary_key=True, index=True)
    signer_name = Column(String(200))
    signer_role = Column(String(200))
    signature_path = Column(String(500), nullable=True)  # path to signature PNG
    stamp_path = Column(String(500), nullable=True)       # path to stamp PNG
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    provider = Column(String(30), default="stripe")
    plan_id = Column(String(100), nullable=False)
    checkout_session_id = Column(String(255), unique=True, index=True)
    payment_intent_id = Column(String(255), nullable=True, index=True)
    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(10), default="usd")
    status = Column(String(30), default="pending", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="payment_transactions")


User.payment_transactions = relationship(
    "PaymentTransaction",
    back_populates="user",
    order_by="PaymentTransaction.created_at.desc()"
)


class PaymentUsage(Base):
    __tablename__ = "payment_usages"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String(50), nullable=False, index=True)  # verify_id | verify_pin | verify_pdf | download
    reference = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="payment_usages")


User.payment_usages = relationship(
    "PaymentUsage",
    back_populates="user",
    order_by="PaymentUsage.created_at.desc()"
)
