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
        "theme": {"primary": "#0b3d91", "accent": "#b8860b", "soft": "#e8f0ff"},
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
        "theme": {"primary": "#14532d", "accent": "#0f766e", "soft": "#e8f8f2"},
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
        "theme": {"primary": "#7c2d12", "accent": "#c2410c", "soft": "#fff1e8"},
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
        "theme": {"primary": "#1e293b", "accent": "#0f766e", "soft": "#eef2f7"},
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
        "theme": {"primary": "#1d4ed8", "accent": "#0f766e", "soft": "#edf4ff"},
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
        "theme": {"primary": "#4338ca", "accent": "#b45309", "soft": "#eeefff"},
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
        "theme": {"primary": "#0f766e", "accent": "#155e75", "soft": "#eafaf8"},
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
        "theme": {"primary": "#7f1d1d", "accent": "#9f1239", "soft": "#fff0f1"},
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
        "theme": {"primary": "#854d0e", "accent": "#a16207", "soft": "#fff8e6"},
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
        "theme": {"primary": "#0369a1", "accent": "#0f766e", "soft": "#eaf7ff"},
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
        "theme": {"primary": "#334155", "accent": "#0f766e", "soft": "#f1f5f9"},
        "fields": [
            ("student_name", "Recipient Name"),
            ("course_name", "Title / Subject"),
        ],
    },
}

DEFAULT_TYPE = "certificate"

# Fields that must always be provided by the admin.
REQUIRED_KEYS = {"student_name", "course_name"}

_BASE_CSS = """
    @page { size: A4 landscape; margin: 11mm; }
    body { font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0; color: #1f2937; }
    .sheet { border: 5px solid %(primary)s; background: #ffffff; }
    .sheet-inner { border: 1px solid %(accent)s; margin: 4px; padding: 0; background: #ffffff; }
    .top-band { height: 8px; background: %(primary)s; }
    .content-wrap { padding: 12px 18px; background: %(soft)s; }
    .header-table { width: 100%%; border-collapse: collapse; }
    .brand { font-family: Times-Roman, serif; font-size: 18pt; font-weight: 700; color: %(primary)s; letter-spacing: 0.6px; text-transform: uppercase; }
    .org { font-size: 8pt; color: #4b5563; margin-top: 2px; letter-spacing: 0.7px; text-transform: uppercase; }
    .suborg { font-size: 7.5pt; color: #6b7280; margin-top: 1px; letter-spacing: 0.3px; }
    .badge-cell { text-align: right; vertical-align: top; }
    .badge { display: inline-block; font-size: 7.5pt; font-weight: 700; color: %(primary)s; border: 1px solid %(primary)s; padding: 4px 8px; background: #ffffff; text-transform: uppercase; letter-spacing: 0.6px; }
    .title { font-family: Times-Roman, serif; font-size: 29pt; font-weight: 700; color: %(primary)s; text-align: center; margin-top: 10px; letter-spacing: 0.5px; }
    .intro { font-size: 10.5pt; color: #4b5563; text-align: center; margin-top: 7px; }
    .recipient { font-family: Times-Roman, serif; font-size: 24pt; font-weight: 700; color: #0f172a; text-align: center; margin-top: 10px; padding-bottom: 7px; border-bottom: 1px solid %(accent)s; }
    .subject-label { font-size: 8pt; color: #6b7280; text-transform: uppercase; text-align: center; margin-top: 10px; }
    .subject { font-family: Times-Roman, serif; font-size: 15pt; color: %(accent)s; font-weight: 700; text-align: center; margin-top: 2px; }
    .details-table { width: 100%%; border-collapse: collapse; margin-top: 12px; background: #ffffff; border: 1px solid #d1d5db; }
    .detail-label { width: 42%%; font-size: 9pt; color: #374151; font-weight: 700; text-transform: uppercase; padding: 6px 8px; border: 1px solid #e5e7eb; background: #f9fafb; }
    .detail-value { width: 58%%; font-size: 10pt; color: #111827; font-weight: 600; padding: 6px 8px; border: 1px solid #e5e7eb; }
    .issue-date { margin-top: 11px; font-size: 9pt; color: #6b7280; text-align: center; }
    .footer-table { width: 100%%; border-collapse: collapse; margin-top: 14px; }
    .sig-cell { width: 40%%; text-align: center; vertical-align: bottom; }
    .qr-cell { width: 20%%; text-align: center; vertical-align: bottom; }
    .stamp-cell { width: 40%%; text-align: center; vertical-align: bottom; }
    .sig-img { height: 38px; }
    .stamp-img { height: 62px; }
    .qr-img { width: 70px; height: 70px; }
    .sig-line { margin-top: 5px; border-top: 1px solid %(primary)s; font-size: 9pt; color: #334155; padding-top: 3px; font-weight: 700; }
    .sig-role { font-size: 8pt; color: #6b7280; }
    .slot-empty { font-size: 8pt; color: #9ca3af; font-style: italic; border: 1px dashed #d1d5db; padding: 8px 5px; margin: 0 12px; }
    .verify { font-size: 7.5pt; color: #6b7280; margin-top: 3px; }
    .meta-row { margin-top: 10px; border-top: 1px solid #d1d5db; padding-top: 6px; }
    .certid { font-size: 8pt; color: #4b5563; text-align: center; }
    .regcode { font-size: 7.5pt; color: #6b7280; text-align: center; margin-top: 1px; }
    .crypto { font-size: 7pt; color: #9ca3af; text-align: center; margin-top: 2px; }
"""


def _get_config(cert_type: str) -> dict:
    return CERT_TYPE_CONFIG.get(cert_type) or CERT_TYPE_CONFIG[DEFAULT_TYPE]


def _get_theme(cert_type: str) -> dict[str, str]:
    cfg = _get_config(cert_type)
    return cfg.get("theme", CERT_TYPE_CONFIG[DEFAULT_TYPE]["theme"])


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
    theme = _get_theme(cert_type)
    fields = cfg["fields"]
    field_map = dict(fields)
    css = _BASE_CSS % theme

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
            '<table class="details-table" cellpadding="0" cellspacing="0">\n'
            + "\n".join(detail_rows)
            + "\n            </table>"
        )

    return (
        "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\" />\n<style>"
        + css
        + "</style>\n</head>\n<body>\n"
        '    <div class="sheet">\n'
        '        <div class="sheet-inner">\n'
        '            <div class="top-band"></div>\n'
        '            <div class="content-wrap">\n'
        '            <table class="header-table" cellpadding="0" cellspacing="0">\n'
        '                <tr>\n'
        '                    <td>\n'
        '                        <div class="brand">EduCerts</div>\n'
        '                        <div class="org">Federal Democratic Republic of Ethiopia</div>\n'
        '                        <div class="suborg">Credential Verification and Trust Registry</div>\n'
        '                    </td>\n'
        '                    <td class="badge-cell"><span class="badge">Official Document</span></td>\n'
        '                </tr>\n'
        '            </table>\n'
        f'            <div class="title">{cfg["title"]}</div>\n'
        f'            <div class="intro">{cfg["intro"]}</div>\n'
        '            <div class="recipient">{{ student_name }}</div>\n'
        f'            {subject_html}\n'
        f'            {details_html}\n'
        '            <div class="issue-date">Issued on {{ issued_at }}</div>\n'
        '            <table class="footer-table" cellpadding="0" cellspacing="0">\n'
        '                <tr>\n'
        '                    <td class="sig-cell">\n'
        '                        {% if digital_signature %}<img src="data:image/png;base64,{{ digital_signature }}" class="sig-img" />{% else %}<div class="slot-empty">Signature Pending</div>{% endif %}\n'
        '                        <div class="sig-line">{{ signer_name }}</div>\n'
        '                        <div class="sig-role">{{ signer_role }}</div>\n'
        '                    </td>\n'
        '                    <td class="qr-cell">\n'
        '                        <img src="data:image/png;base64,{{ qr_code }}" class="qr-img" />\n'
        '                        <div class="verify">Scan to Verify</div>\n'
        '                    </td>\n'
        '                    <td class="stamp-cell">\n'
        '                        {% if stamp %}<img src="data:image/png;base64,{{ stamp }}" class="stamp-img" />{% else %}<div class="slot-empty">Stamp Pending</div>{% endif %}\n'
        '                    </td>\n'
        '                </tr>\n'
        '            </table>\n'
        '            <div class="meta-row">\n'
        '                <div class="certid">Verification ID: {{ cert_id }}</div>\n'
        '                <div class="regcode">Registry Ref: EC-{{ cert_id }}</div>\n'
        '                <div class="crypto">Secured with Ed25519 &middot; {{ signature }}</div>\n'
        '            </div>\n'
        '            </div>\n'
        '        </div>\n'
        '    </div>\n'
        "</body>\n</html>"
    )


def get_builtin_template_label(cert_type: str) -> str:
    """Return a human-friendly template name for a category."""
    return _get_config(cert_type)["title"]
