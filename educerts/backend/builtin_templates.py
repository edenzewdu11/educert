"""
Built-in certificate templates.

Instead of requiring admins to upload a template file, the system ships with a
professionally designed HTML certificate template that adapts to the selected
certificate category. Selecting a category activates the matching template.

The generated HTML uses {{ placeholder }} syntax so it flows through the exact
same parsing / rendering / signing pipeline as user-uploaded templates.
"""

from __future__ import annotations

# Per-category presentation config.
# `title`   -> big certificate heading
# `intro`   -> line shown above the recipient name
# `subject` -> line describing the course / achievement (uses {{ course_name }})
CERT_TYPE_CONFIG: dict[str, dict[str, str]] = {
    "degree": {
        "title": "Degree Certificate",
        "intro": "This is to certify that",
        "subject": "has been awarded the degree of {{ course_name }}",
    },
    "birth_certificate": {
        "title": "Birth Certificate",
        "intro": "This is to certify the birth record of",
        "subject": "Registered particulars: {{ course_name }}",
    },
    "trade": {
        "title": "Trade Certificate",
        "intro": "This is to certify that",
        "subject": "has demonstrated proficiency in {{ course_name }}",
    },
    "business": {
        "title": "Business License",
        "intro": "This license is granted to",
        "subject": "authorizing operation of {{ course_name }}",
    },
    "education": {
        "title": "Certificate of Education",
        "intro": "This is to certify that",
        "subject": "has successfully completed {{ course_name }}",
    },
    "diploma": {
        "title": "Diploma",
        "intro": "This is to certify that",
        "subject": "has been awarded a diploma in {{ course_name }}",
    },
    "training": {
        "title": "Certificate of Training",
        "intro": "This is to certify that",
        "subject": "has successfully completed the training program in {{ course_name }}",
    },
    "professional": {
        "title": "Professional Certificate",
        "intro": "This is to certify that",
        "subject": "is a certified professional in {{ course_name }}",
    },
    "achievement": {
        "title": "Certificate of Achievement",
        "intro": "This certificate is proudly presented to",
        "subject": "in recognition of outstanding achievement in {{ course_name }}",
    },
    "attendance": {
        "title": "Certificate of Attendance",
        "intro": "This is to certify that",
        "subject": "attended {{ course_name }}",
    },
    "certificate": {
        "title": "Certificate",
        "intro": "This is to certify that",
        "subject": "for {{ course_name }}",
    },
}

DEFAULT_TYPE = "certificate"


def _build_html(title: str, intro: str, subject: str) -> str:
    """Return a full HTML certificate document string with {{ placeholders }}.

    Layout is table-based and uses inline / simple CSS for xhtml2pdf (pisa)
    compatibility.
    """
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
    @page {{ size: A4 landscape; margin: 0; }}
    body {{ font-family: 'Helvetica', 'Arial', sans-serif; margin: 0; padding: 0; color: #1e293b; }}
    .frame {{ width: 760px; margin: 30px auto; border: 14px solid #0f172a; padding: 6px; background: #ffffff; }}
    .inner {{ border: 2px solid #0284c7; padding: 36px 48px; text-align: center; }}
    .brand {{ font-size: 22px; font-weight: bold; color: #0284c7; letter-spacing: 3px; text-transform: uppercase; }}
    .org {{ font-size: 11px; color: #64748b; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }}
    .rule {{ width: 90px; height: 3px; background: #0284c7; margin: 16px auto 24px auto; }}
    .title {{ font-size: 40px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; }}
    .intro {{ font-size: 15px; color: #64748b; font-style: italic; margin-bottom: 14px; }}
    .recipient {{ font-size: 32px; font-weight: bold; color: #0f172a; padding-bottom: 8px; margin: 4px auto 4px auto; width: 70%; border-bottom: 2px solid #cbd5e1; }}
    .subject {{ font-size: 18px; color: #0369a1; font-weight: 600; margin-top: 20px; }}
    .date {{ font-size: 13px; color: #94a3b8; margin-top: 18px; }}
    .footer {{ width: 100%; margin-top: 40px; }}
    .sig-cell {{ width: 40%; text-align: center; vertical-align: bottom; }}
    .qr-cell {{ width: 20%; text-align: center; vertical-align: bottom; }}
    .stamp-cell {{ width: 40%; text-align: center; vertical-align: bottom; }}
    .sig-img {{ height: 60px; }}
    .stamp-img {{ height: 90px; }}
    .qr-img {{ width: 90px; height: 90px; }}
    .sig-line {{ border-top: 1px solid #0f172a; margin-top: 6px; padding-top: 4px; font-size: 12px; font-weight: 700; color: #475569; }}
    .sig-role {{ font-size: 10px; color: #94a3b8; }}
    .verify {{ font-size: 9px; color: #94a3b8; margin-top: 4px; }}
    .certid {{ font-size: 9px; color: #94a3b8; margin-top: 18px; letter-spacing: 1px; }}
    .crypto {{ font-size: 8px; color: #cbd5e1; margin-top: 4px; }}
</style>
</head>
<body>
    <div class="frame">
        <div class="inner">
            <div class="brand">EduCerts</div>
            <div class="org">Federal Democratic Republic of Ethiopia</div>
            <div class="rule"></div>

            <div class="title">{title}</div>
            <div class="intro">{intro}</div>
            <div class="recipient">{{{{ student_name }}}}</div>
            <div class="subject">{subject}</div>
            <div class="date">Issued on {{{{ issued_at }}}}</div>

            <table class="footer" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="sig-cell">
                        <img src="data:image/png;base64,{{{{ digital_signature }}}}" class="sig-img" />
                        <div class="sig-line">{{{{ signer_name }}}}</div>
                        <div class="sig-role">{{{{ signer_role }}}}</div>
                    </td>
                    <td class="qr-cell">
                        <img src="data:image/png;base64,{{{{ qr_code }}}}" class="qr-img" />
                        <div class="verify">Scan to Verify</div>
                    </td>
                    <td class="stamp-cell">
                        <img src="data:image/png;base64,{{{{ stamp }}}}" class="stamp-img" />
                    </td>
                </tr>
            </table>

            <div class="certid">Verification ID: {{{{ cert_id }}}}</div>
            <div class="crypto">Secured with Ed25519 &middot; {{{{ signature }}}}</div>
        </div>
    </div>
</body>
</html>"""


def get_builtin_template_html(cert_type: str) -> str:
    """Return the HTML template string for a certificate category."""
    cfg = CERT_TYPE_CONFIG.get(cert_type) or CERT_TYPE_CONFIG[DEFAULT_TYPE]
    return _build_html(cfg["title"], cfg["intro"], cfg["subject"])


def get_builtin_template_label(cert_type: str) -> str:
    """Return a human-friendly template name for a category."""
    cfg = CERT_TYPE_CONFIG.get(cert_type) or CERT_TYPE_CONFIG[DEFAULT_TYPE]
    return cfg["title"]
