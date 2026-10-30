import os
import datetime
from typing import List, Dict, Any
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

class SecurityReportGenerator:
    """
    Generates enterprise-grade PDF, JSON, and CSV security assessment reports.
    """

    SEVERITY_COLORS = {
        "CRITICAL": colors.HexColor("#dc2626"),
        "HIGH": colors.HexColor("#ea580c"),
        "MEDIUM": colors.HexColor("#d97706"),
        "LOW": colors.HexColor("#0284c7"),
        "INFO": colors.HexColor("#64748b"),
        "FIXED": colors.HexColor("#16a34a")
    }

    @classmethod
    def generate_pdf(cls, project_data: Dict[str, Any], scan_data: Dict[str, Any], vulnerabilities: List[Dict[str, Any]], output_path: str) -> str:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom Typography Styles
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=24,
            leading=28,
            textColor=colors.HexColor("#0f172a")
        )
        subtitle_style = ParagraphStyle(
            'DocSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#475569")
        )
        h2_style = ParagraphStyle(
            'H2Style',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=15,
            leading=19,
            textColor=colors.HexColor("#1e293b"),
            spaceBefore=14,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#334155")
        )
        code_style = ParagraphStyle(
            'CodeStyle',
            parent=styles['Normal'],
            fontName='Courier',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#0f172a"),
            backColor=colors.HexColor("#f1f5f9")
        )

        story = []

        # Header Banner
        story.append(Paragraph("<b>VULNSCAN</b> &mdash; Automated Security Intelligence", subtitle_style))
        story.append(Spacer(1, 4))
        story.append(Paragraph("Security Assessment & Vulnerability Audit Report", title_style))
        story.append(Paragraph(f"Generated on {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')} | Platform: VulnScan v1.0", subtitle_style))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#2563eb"), spaceAfter=15))

        # Project & Assessment Metadata Table
        proj_name = project_data.get('name', 'Demonstration Target')
        target_url = project_data.get('target_url') or project_data.get('source_path') or 'Localhost Audit'
        scan_type = scan_data.get('scan_type', 'Comprehensive').upper()
        sec_score = project_data.get('security_score', 85)

        meta_data = [
            [Paragraph("<b>Target Project:</b>", body_style), Paragraph(proj_name, body_style),
             Paragraph("<b>Security Score:</b>", body_style), Paragraph(f"<b>{sec_score} / 100</b>", body_style)],
            [Paragraph("<b>Target Scope:</b>", body_style), Paragraph(str(target_url), body_style),
             Paragraph("<b>Scan Mode:</b>", body_style), Paragraph(scan_type, body_style)],
            [Paragraph("<b>Scan ID:</b>", body_style), Paragraph(f"#{scan_data.get('id', 1)}", body_style),
             Paragraph("<b>Gate Status:</b>", body_style), Paragraph("<b>FAIL (Critical findings present)</b>" if scan_data.get('critical_count', 0) > 0 else "<b>PASS</b>", body_style)]
        ]

        meta_table = Table(meta_data, colWidths=[1.2*inch, 2.5*inch, 1.2*inch, 2.5*inch])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 15))

        # Section 1: Executive Summary
        story.append(Paragraph("1. Executive Summary", h2_style))
        summary_text = (
            f"VulnScan completed a multi-vector security assessment across static source code (SAST), "
            f"runtime endpoints (DAST), software dependencies (SCA), and credential exposure checks. "
            f"The audit identified <b>{len(vulnerabilities)} total finding(s)</b> across the target scope. "
            f"Immediate attention is recommended for Critical and High severity findings prior to production deployment."
        )
        story.append(Paragraph(summary_text, body_style))
        story.append(Spacer(1, 8))

        # Vulnerability Metrics Table
        sev_counts = [
            ("CRITICAL", scan_data.get('critical_count', 0), colors.HexColor("#dc2626")),
            ("HIGH", scan_data.get('high_count', 0), colors.HexColor("#ea580c")),
            ("MEDIUM", scan_data.get('medium_count', 0), colors.HexColor("#d97706")),
            ("LOW", scan_data.get('low_count', 0), colors.HexColor("#0284c7")),
            ("INFO", scan_data.get('info_count', 0), colors.HexColor("#64748b")),
            ("FIXED", scan_data.get('fixed_count', 0), colors.HexColor("#16a34a"))
        ]

        metric_header = [Paragraph(f"<b>{s[0]}</b>", body_style) for s in sev_counts]
        metric_values = [Paragraph(f"<b>{s[1]}</b>", body_style) for s in sev_counts]
        metric_table = Table([metric_header, metric_values], colWidths=[1.23*inch]*6)
        metric_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(metric_table)
        story.append(Spacer(1, 15))

        # Section 2: Detailed Vulnerability Findings
        story.append(Paragraph("2. Detailed Vulnerability Findings", h2_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=10))

        if not vulnerabilities:
            story.append(Paragraph("No security vulnerabilities detected during this scan.", body_style))
        else:
            for idx, v in enumerate(vulnerabilities, start=1):
                sev = v.get('severity', 'MEDIUM').upper()
                sev_color = cls.SEVERITY_COLORS.get(sev, colors.HexColor("#d97706"))

                item_header = [
                    [Paragraph(f"<b>#{idx} {v.get('title', 'Vulnerability')}</b>", ParagraphStyle('VTitle', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor("#0f172a"))),
                     Paragraph(f"<b>{sev}</b>", ParagraphStyle('VSev', parent=body_style, fontName='Helvetica-Bold', textColor=sev_color))]
                ]
                item_header_table = Table(item_header, colWidths=[6.0*inch, 1.4*inch])
                item_header_table.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
                    ('TOPPADDING', (0,0), (-1,-1), 4),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ]))
                story.append(item_header_table)
                story.append(Spacer(1, 4))

                details = [
                    [Paragraph("<b>Category:</b>", body_style), Paragraph(v.get('category', 'General'), body_style),
                     Paragraph("<b>CWE / CVE:</b>", body_style), Paragraph(f"{v.get('cwe') or 'N/A'} {v.get('cve') or ''}", body_style)],
                    [Paragraph("<b>Location:</b>", body_style), Paragraph(f"{v.get('file_path') or v.get('endpoint') or 'Application Code'}:{v.get('line_number') or ''}", body_style),
                     Paragraph("<b>Source:</b>", body_style), Paragraph(v.get('detection_source', 'SAST'), body_style)],
                ]
                detail_table = Table(details, colWidths=[1.1*inch, 2.6*inch, 1.1*inch, 2.6*inch])
                detail_table.setStyle(TableStyle([
                    ('INNERGRID', (0,0), (-1,-1), 0.25, colors.HexColor("#f1f5f9")),
                    ('TOPPADDING', (0,0), (-1,-1), 3),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 3),
                ]))
                story.append(detail_table)
                story.append(Spacer(1, 4))

                if v.get('evidence'):
                    story.append(Paragraph("<b>Technical Evidence:</b>", body_style))
                    story.append(Paragraph(f"<code>{v.get('evidence')[:250]}</code>", code_style))
                    story.append(Spacer(1, 4))

                if v.get('technical_explanation'):
                    story.append(Paragraph(f"<b>Technical Explanation:</b> {v.get('technical_explanation')}", body_style))
                    story.append(Spacer(1, 3))

                if v.get('recommended_solution'):
                    story.append(Paragraph(f"<b>Remediation:</b> {v.get('recommended_solution')}", body_style))
                    story.append(Spacer(1, 8))

                story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0"), spaceAfter=8))

        # Section 3: DevSecOps Gate & Remediation Roadmap
        story.append(Spacer(1, 10))
        story.append(Paragraph("3. DevSecOps Deployment Gate & Next Steps", h2_style))
        roadmap_text = (
            "<b>Deployment Policy Enforcement:</b><br/>"
            "• Critical and High severity findings must be resolved and verified before staging deployment.<br/>"
            "• Use VulnScan's AI Security Assistant to review contextual code patches.<br/>"
            "• Execute Fix Verification Rescan to mark resolved items and unblock the CI/CD pipeline."
        )
        story.append(Paragraph(roadmap_text, body_style))
        story.append(Spacer(1, 15))
        story.append(Paragraph("VulnScan &bull; Automated Security Testing & Validation Engine &bull; Confidential Assessment", subtitle_style))

        doc.build(story)
        return output_path

