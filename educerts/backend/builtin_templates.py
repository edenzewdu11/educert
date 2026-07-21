"""
Built-in certificate templates.

Instead of requiring admins to upload a template file, the system ships with a
professionally designed HTML certificate template that adapts to the selected
certificate category. Selecting a category activates the matching template.

The generated HTML uses {{ placeholder }} syntax so it flows through the exact
same parsing / rendering / signing pipeline as user-uploaded templates.
"""

from __future__ import annotations

# Per-category configuration.
#   title  -> big certificate heading
#   intro  -> italic line shown above the recipient name
#   fields -> ordered list of (key, label). The FIRST entry is always the
#             recipient (`student_name`) so listings / DB stay consistent.
#             If a `course_name` entry is present it is rendered as the big
#             "subject" line; every other field is rendered in a details grid.
#
# Each certificate category deliberately has a DIFFERENT set of fields so the
# generated form and template are unique per type.
CERT_TYPE_CONFIG: dict[str, dict] = {
    "degree": {
        "title": "Degree Certificate",
        "intro": "This is to certify that",
        "fields": [
            ("student_name", "Graduate Name"),
            ("course_name", "Degree Awarded"),
            ("major", "Major / Field of Study"),
            ("gpa", "GPA / Class"),
            ("graduation_date", "Graduation Date"),
        ],
    },
    "birth_certificate": {
        "title": "Birth Certificate",
        "intro": "This is to certify the birth record of",
        "fields": [
            ("student_name", "Child's Full Name"),
            ("date_of_birth", "Date of Birth"),
            ("place_of_birth", "Place of Birth"),
            ("gender", "Gender"),
            ("father_name", "Father's Name"),
            ("mother_name", "Mother's Name"),
        ],
    },
    "trade": {
        "title": "Trade Certificate",
        "intro": "This is to certify that",
        "fields": [
            ("student_name", "Recipient Name"),
            ("course_name", "Trade / Skill"),
            ("skill_level", "Skill Level"),
            ("training_hours", "Training Hours"),
        ],
    },
    "business": {
        "title": "Business License",
        "intro": "This license is granted to",
        "fields": [
            ("student_name", "Business Name"),
            ("owner_name", "Owner / Proprietor"),
            ("license_number", "License Number"),
            ("business_type", "Business Type"),
            ("valid_until", "Valid Until"),
        ],
    },
    "education": {
        "title": "Certificate of Education",
        "intro": "This is to certify that",
        "fields": [
            ("student_name", "Student Name"),
            ("course_name", "Course / Subject"),
            ("grade", "Grade / Result"),
            ("institution", "Institution"),
        ],
    },
    "diploma": {
        "title": "Diploma",
        "intro": "This is to certify that",
        "fields": [
            ("student_name", "Graduate Name"),
            ("course_name", "Diploma Program"),
            ("specialization", "Specialization"),
            ("completion_date", "Completion Date"),
        ],
    },
    "training": {
        "title": "Certificate of Training",
        "intro": "This is to certify that",
        "fields": [
            ("student_name", "Participant Name"),
            ("course_name", "Training Program"),
            ("duration", "Duration"),
            ("completion_date", "Completion Date"),
        ],
    },
    "professional": {
        "title": "Professional Certificate",
        "intro": "This is to certify that",
        "fields": [
            ("student_name", "Recipient Name"),
            ("course_name", "Certification / Profession"),
            ("license_number", "License / Reg. Number"),
            ("valid_until", "Valid Until"),
        ],
    },
    "achievement": {
        "title": "Certificate of Achievement",
        "intro": "This certificate is proudly presented to",
        "fields": [
            ("student_name", "Recipient Name"),
            ("course_name", "Achievement / Award"),
            ("category", "Category"),
            ("date_awarded", "Date Awarded"),
        ],
    },
    "attendance": {
        "title": "Certificate of Attendance",
        "intro": "This is to certify that",
        "fields": [
            ("student_name", "Attendee Name"),
            ("course_name", "Event / Program"),
            ("event_date", "Event Date"),
            ("location", "Location"),
        ],
    },
    "certificate": {
        "title": "Certificate",
        "intro": "This is to certify that",
        "fields": [
            ("student_name", "Recipient Name"),
            ("course_name", "Title / Subject"),
        ],
    },
}

DEFAULT_TYPE = "certificate"

# Fields that must always be provided by the admin.
REQUIRED_KEYS = {"student_name", "course_name"}

_CSS = """
    @page { size: A4 landscape; margin: 0; }
    body { font-family: 'Helvetica', 'Arial', sans-serif; margin: 0; padding: 0; color: #1e293b; }
    .frame { width: 760px; margin: 30px auto; border: 14px solid #0f172a; padding: 6px; background: #ffffff; }
    .inner { border: 2px solid #0284c7; padding: 32px 48px; text-align: center; }
    .brand { font-size: 22px; font-weight: bold; color: #0284c7; letter-spacing: 3px; text-transform: uppercase; }
    .org { font-size: 11px; color: #64748b; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
    .rule { width: 90px; height: 3px; background: #0284c7; margin: 14px auto 20px auto; }
    .title { font-size: 38px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; }
    .intro { font-size: 15px; color: #64748b; font-style: italic; margin-bottom: 12px; }
    .recipient { font-size: 30px; font-weight: bold; color: #0f172a; padding-bottom: 8px; margin: 4px auto 4px auto; width: 70%; border-bottom: 2px solid #cbd5e1; }
    .subject-label { font-size: 11px; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-top: 16px; }
    .subject { font-size: 20px; color: #0369a1; font-weight: 700; margin-top: 2px; }
    .details { width: 80%; margin: 18px auto 0 auto; }
    .detail-label { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 3px 10px; text-align: right; width: 50%; }
    .detail-value { font-size: 14px; color: #0f172a; font-weight: 600; padding: 3px 10px; text-align: left; width: 50%; }
    .date { font-size: 13px; color: #94a3b8; margin-top: 18px; }
    .footer { width: 100%; margin-top: 34px; }
    .sig-cell { width: 40%; text-align: center; vertical-align: bottom; }
    .qr-cell { width: 20%; text-align: center; vertical-align: bottom; }
    .stamp-cell { width: 40%; text-align: center; vertical-align: bottom; }
    .sig-img { height: 55px; }
    .stamp-img { height: 85px; }
    .qr-img { width: 88px; height: 88px; }
    .sig-line { border-top: 1px solid #0f172a; margin-top: 6px; padding-top: 4px; font-size: 12px; font-weight: 700; color: #475569; }
    .sig-role { font-size: 10px; color: #94a3b8; }
    .verify { font-size: 9px; color: #94a3b8; margin-top: 4px; }
    .certid { font-size: 9px; color: #94a3b8; margin-top: 16px; letter-spacing: 1px; }
    .crypto { font-size: 8px; color: #cbd5e1; margin-top: 4px; }
"""


def _get_config(cert_type: str) -> dict:
    return CERT_TYPE_CONFIG.get(cert_type) or CERT_TYPE_CONFIG[DEFAULT_TYPE]


def get_builtin_template_fields(cert_type: str) -> list[dict]:
    """Return ordered field definitions [{key, label, required}] for a category."""
    cfg = _get_config(cert_type)
    return [
        {"key": key, "label": label, "required": key in REQUIRED_KEYS}
        for key, label in cfg["fields"]
    ]


def get_builtin_template_html(cert_type: str) -> str:
    """Return the HTML template string (with {{ placeholders }}) for a category."""
    cfg = _get_config(cert_type)
    fields = cfg["fields"]
    field_map = dict(fields)

    # Subject line uses course_name when present.
    subject_html = ""
    if "course_name" in field_map:
        subject_html = (
            f'<div class="subject-label">{field_map["course_name"]}</div>\n'
            f'            <div class="subject">{{{{ course_name }}}}</div>'
        )

    # Detail rows = every field except recipient (student_name) and course_name.
    detail_rows = []
    for key, label in fields:
        if key in ("student_name", "course_name"):
            continue
        detail_rows.append(
            f'                <tr><td class="detail-label">{label}</td>'
            f'<td class="detail-value">{{{{ {key} }}}}</td></tr>'
        )
    details_html = ""
    if detail_rows:
        details_html = (
            '<table class="details" cellpadding="0" cellspacing="0">\n'
            + "\n".join(detail_rows)
            + "\n            </table>"
        )

    return (
        "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\" />\n<style>"
        + _CSS
        + "</style>\n</head>\n<body>\n"
        '    <div class="frame">\n'
        '        <div class="inner">\n'
        '            <div class="brand">EduCerts</div>\n'
        '            <div class="org">Federal Democratic Republic of Ethiopia</div>\n'
        '            <div class="rule"></div>\n\n'
        f'            <div class="title">{cfg["title"]}</div>\n'
        f'            <div class="intro">{cfg["intro"]}</div>\n'
        '            <div class="recipient">{{ student_name }}</div>\n'
        f'            {subject_html}\n'
        f'            {details_html}\n'
        '            <div class="date">Issued on {{ issued_at }}</div>\n\n'
        '            <table class="footer" cellpadding="0" cellspacing="0">\n'
        '                <tr>\n'
        '                    <td class="sig-cell">\n'
        '                        <img src="data:image/png;base64,{{ digital_signature }}" class="sig-img" />\n'
        '                        <div class="sig-line">{{ signer_name }}</div>\n'
        '                        <div class="sig-role">{{ signer_role }}</div>\n'
        '                    </td>\n'
        '                    <td class="qr-cell">\n'
        '                        <img src="data:image/png;base64,{{ qr_code }}" class="qr-img" />\n'
        '                        <div class="verify">Scan to Verify</div>\n'
        '                    </td>\n'
        '                    <td class="stamp-cell">\n'
        '                        <img src="data:image/png;base64,{{ stamp }}" class="stamp-img" />\n'
        '                    </td>\n'
        '                </tr>\n'
        '            </table>\n\n'
        '            <div class="certid">Verification ID: {{ cert_id }}</div>\n'
        '            <div class="crypto">Secured with Ed25519 &middot; {{ signature }}</div>\n'
        '        </div>\n'
        '    </div>\n'
        "</body>\n</html>"
    )


def get_builtin_template_label(cert_type: str) -> str:
    """Return a human-friendly template name for a category."""
    return _get_config(cert_type)["title"]
