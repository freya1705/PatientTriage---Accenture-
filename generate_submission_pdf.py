"""
Publication-Grade PDF Generator for PatientTriage.ai
Generates PatientTriage_AI_Accenture_Submission_README.pdf for Accenture Challenge Round 2
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(36, 11 * 72 - 28, "PatientTriage.ai — Technical Submission README")
            self.drawRightString(8.5 * 72 - 36, 11 * 72 - 28, "Accenture Innovation Challenge 2026")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(36, 11 * 72 - 32, 8.5 * 72 - 36, 11 * 72 - 32)

        # Footer (all pages)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * 72 - 36, 22, page_text)
        self.drawString(36, 22, "Confidential — Prototype Submission Document &bull; Evaluated on 20 Synthetic Scenarios")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(36, 32, 8.5 * 72 - 36, 32)

        self.restoreState()

def build_pdf():
    pdf_path = os.path.join(os.path.dirname(__file__), "PatientTriage_AI_Accenture_Submission_README.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=38,
        bottomMargin=38
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=2
    )

    tagline_style = ParagraphStyle(
        'DocTagline',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13.5,
        textColor=colors.HexColor('#0284c7'),
        spaceAfter=2
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#64748b'),
        spaceAfter=8
    )

    h1_style = ParagraphStyle(
        'CustomH1',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'CustomBody',
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'CustomBullet',
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#1e293b'),
        leftIndent=10,
        firstLineIndent=-6,
        spaceAfter=2.5
    )

    code_style = ParagraphStyle(
        'CustomCode',
        fontName='Courier',
        fontSize=7,
        leading=9,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#0369a1')
    )

    story = []

    # Title & Banner
    story.append(Paragraph("PatientTriage.ai", title_style))
    story.append(Paragraph("“Triage is a snapshot. Risk isn't.”", tagline_style))
    story.append(Paragraph("A Continuous Safety Decision-Support Layer for Emergency Waiting Rooms &bull; Accenture Innovation Challenge 2026", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284c7'), spaceAfter=6))

    # Meta Table
    meta_data = [
        [
            Paragraph("<b>COMPETITION TRACK</b><br/>Round 2 Technical Prototype", body_style),
            Paragraph("<b>CORE STACK</b><br/>Python 3.13 / FastAPI / React 19", body_style),
            Paragraph("<b>DEPLOYMENT</b><br/>Edge / On-Premise Air-Gapped", body_style),
            Paragraph("<b>REPOSITORY</b><br/>github.com/freya1705/PatientTriage---Accenture-", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[1.8 * inch, 1.8 * inch, 1.8 * inch, 2.1 * inch])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 4))

    # 1. Project Overview
    story.append(Paragraph("1. Project Overview &amp; Introduction", h1_style))
    story.append(Paragraph(
        "<b>PatientTriage.ai</b> is an emergency department clinical decision-support system and continuous physiological safety surveillance layer. "
        "While traditional emergency triage treats patient prioritization as a static, one-time snapshot at hospital intake, PatientTriage.ai continuously "
        "tracks patient waiting times, vital sign trajectory velocity (&Delta;SpO₂, &Delta;HR), data uncertainty, and active clinical attention. "
        "The intelligence layer performs continuous physiological trend analysis, uncertainty scoring, confidence decay, and dynamic attention-gap prioritization, "
        "while deterministic safety rules provide hard guardrails and clinicians retain final decision authority.",
        body_style
    ))
    story.append(Paragraph(
        "The platform answers the single most critical operational question facing emergency clinicians: "
        "<b>“Who in the waiting room is no longer safe to keep waiting?”</b>",
        callout_style
    ))

    # 2. Core Problem & EHR Moat
    story.append(Paragraph("2. The Core Problem &amp; Competitive Moat (Vs. Legacy EHR Scores)", h1_style))
    story.append(Paragraph("• <b>1. Silent Waiting Room Deterioration:</b> ESI Level 3/4 patients may worsen unmonitored; physiological decline may remain undetected until a subsequent reassessment or clinical deterioration becomes apparent.", bullet_style))
    story.append(Paragraph("• <b>2. Missing Vitals &amp; Stale Data:</b> When vitals are missing, legacy systems default to low urgency. Under <i>Unknown is NOT Safe</i>, missing data heightens clinical vigilance.", bullet_style))
    story.append(Paragraph("• <b>3. The Attention Bottleneck:</b> Attended critical patients block static queues, while unattended deteriorating patients remain buried.", bullet_style))
    story.append(Paragraph("• <b>Competitive Moat vs. Native EHRs (Epic EDI / Cerner MEWS):</b> Legacy EHR algorithms are designed for admitted inpatients in hospital beds and only score raw severity. PatientTriage.ai is purpose-built for the waiting room and uniquely factors in <b>physician coverage</b> and <b>evidence staleness decay</b>.", bullet_style))

    # 3. 3-Tier Layered Architecture & Multimodal Ingestion
    story.append(Paragraph("3. System Architecture: 3-Tier Layered Design", h1_style))
    arch_data = [
        [Paragraph("<b>Tier</b>", body_style), Paragraph("<b>Responsibilities &amp; Scope</b>", body_style), Paragraph("<b>Key Modules</b>", body_style)],
        [Paragraph("<b>Tier 1: Deterministic Safety Layer</b>", body_style), Paragraph("Deterministic red-flags (SpO₂ &lt; 85%, SBP &lt; 75 mmHg, FAST Stroke, pediatric stridor) that bypass statistical models. Counterfactual downgrade safety blocking.", body_style), Paragraph("<code>safety_guardrails.py</code><br/><code>downgrade_guard.py</code>", code_style)],
        [Paragraph("<b>Tier 2: AI &amp; Decision Support</b>", body_style), Paragraph("Continuous vital trajectory velocity (&Delta;SpO₂, &Delta;HR), dynamic confidence decay (&tau;<sub>staleness</sub>), uncertainty scoring (Unknown &ne; Safe), Attention Gap re-ranking. Multimodal ingestion: BLE wearable oximetry rings/wristbands, kiosks, and nurse tablet walking rounds.", body_style), Paragraph("<code>risk_engine.py</code><br/><code>deterioration_engine.py</code><br/><code>attention_gap_engine.py</code>", code_style)],
        [Paragraph("<b>Tier 3: Clinician Governance</b>", body_style), Paragraph("Clinician override authority with mandatory justification recording, and immutable append-only audit logging.", body_style), Paragraph("<code>audit_service.py</code><br/><code>OverrideModal.jsx</code>", code_style)],
    ]
    arch_table = Table(arch_data, colWidths=[1.8 * inch, 4.0 * inch, 1.7 * inch])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 4))

    # 4. Intelligence Engines & Formula Weights
    story.append(Paragraph("4. Core Intelligence Engines &amp; Default Formula Weights", h1_style))
    story.append(Paragraph("<b>The Attention Gap Priority Equation:</b>", body_style))
    story.append(Paragraph("<code>Action Priority Score = (w_r &times; Risk + Urgency) + (w_d &times; Deterioration) + (w_s &times; Staleness) + Wait Hazard + (w_u &times; Uncertainty) - (w_c &times; Clinical Coverage)</code>", code_style))
    story.append(Paragraph("<b>Default Parameter Bounds:</b> <code>w_r = 1.0</code> (base risk 0–100) &bull; <code>w_d = +25 to +40 pts</code> (&Delta;SpO₂ &le; -5% or &Delta;HR &ge; +20 bpm) &bull; <code>w_s = +20 to +35 pts</code> (safety window expiry) &bull; <code>w_u = +15 to +25 pts</code> (missing vitals / zero history) &bull; <code>w_c = -35 pts</code> (when <code>is_attended = True</code>, surfacing unattended deteriorating patients to Rank #1).", body_style))

    # Page Break for Evaluation & Features
    story.append(PageBreak())

    # 5. Benchmark Cohort & Empirical Impact Evaluation
    story.append(Paragraph("5. Benchmark Cohort &amp; Empirical Impact Evaluation", h1_style))
    story.append(Paragraph("Evaluated across 20 synthetic clinical scenarios representing 5 systematic emergency department failure modes:", body_style))

    eval_data = [
        [Paragraph("<b>Performance Dimension</b>", body_style), Paragraph("<b>Traditional Static Triage</b>", body_style), Paragraph("<b>PatientTriage.ai</b>", body_style), Paragraph("<b>Benchmark Impact</b>", body_style)],
        [Paragraph("<b>Waiting Deterioration Catch Rate</b>", body_style), Paragraph("<font color='#b91c1c'>0/20 detected</font>", body_style), Paragraph("<font color='#047857'><b>20/20 synthetic scenarios detected</b></font>", body_style), Paragraph("<b>100% Benchmark Coverage</b>", body_style)],
        [Paragraph("<b>Stale Observation Flagging</b>", body_style), Paragraph("<font color='#b91c1c'>0/20 flagged</font>", body_style), Paragraph("<font color='#047857'><b>20/20 synthetic cases flagged (EXPIRED)</b></font>", body_style), Paragraph("<b>Zero Unmonitored Stale Waits</b>", body_style)],
        [Paragraph("<b>False Reassurance on Missing Vitals</b>", body_style), Paragraph("<font color='#b91c1c'>High (Treated Normal)</font>", body_style), Paragraph("<font color='#047857'><b>0% False Reassurance (Unknown &ne; Safe)</b></font>", body_style), Paragraph("<b>Eliminates Under-Triage</b>", body_style)],
        [Paragraph("<b>Attention Gap Optimization</b>", body_style), Paragraph("<font color='#b91c1c'>None (Attended Block)</font>", body_style), Paragraph("<font color='#047857'><b>Active (Elevates Unattended)</b></font>", body_style), Paragraph("<b>Optimized Clinician Utilization</b>", body_style)],
        [Paragraph("<b>Unsafe Priority Downgrades Blocked</b>", body_style), Paragraph("<font color='#b91c1c'>0 Guardrails</font>", body_style), Paragraph("<font color='#047857'><b>100% Guarded (Proof Required)</b></font>", body_style), Paragraph("<b>100% Downgrade Guarded</b>", body_style)],
    ]
    eval_table = Table(eval_data, colWidths=[2.2 * inch, 1.8 * inch, 1.8 * inch, 1.7 * inch])
    eval_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(eval_table)
    story.append(Paragraph("<font color='#64748b'><i>*Note: Results reflect simulated evaluations across 20 synthetic clinical benchmark scenarios for prototype demonstration.</i></font>", body_style))
    story.append(Spacer(1, 4))

    # 6. Implementation Roadmap & Primary Trial Endpoints
    story.append(Paragraph("6. Phased Implementation Roadmap &amp; Precise Trial Endpoints", h1_style))
    story.append(Paragraph("• <b>Phase 1 (Q3 2026):</b> Lab Validation &bull; 20 synthetic scenarios verified across 33 automated tests; sub-15ms latency.", bullet_style))
    story.append(Paragraph("• <b>Phase 2 (Q4 2026):</b> Shadow Clinical Trial &bull; Silent background deployment with Epic/Cerner via HL7 FHIR and CDS Hooks.", bullet_style))
    story.append(Paragraph("• <b>Phase 3 (Q1–Q2 2027):</b> Live Pilot &bull; <b>Primary Safety Endpoint:</b> Reduction in Mean Time to Escalation (MTTE) (&gt;45% faster); <b>Operational Endpoint:</b> Nurse false-alarm rate strictly &lt; 2 alerts/nurse/shift; <b>Economic Endpoint:</b> &ge;25% reduction in Left-Without-Being-Seen (LWBS).", bullet_style))
    story.append(Paragraph("• <b>Phase 4 (Q3 2027+):</b> Multi-Hospital Enterprise Network Scaling &bull; Regional dashboarding and telemedicine integration.", bullet_style))

    # 7. Quick Start & Security
    story.append(Paragraph("7. Quick Start &amp; Security Architecture", h1_style))
    story.append(Paragraph("<code># PowerShell 1-Command Launch: .\\start.ps1 | Run 33 Automated Tests: python -m pytest -v</code>", code_style))
    story.append(Paragraph("• <b>Zero PHI:</b> 100% synthetic physiological datasets &bull; <b>Air-Gapped:</b> Zero third-party cloud LLM calls &bull; <b>Audit Ledger:</b> Append-only event logs.", bullet_style))

    # Regulatory Disclaimer
    story.append(Spacer(1, 4))
    disc_data = [[Paragraph("<b>Regulatory &amp; Safety Notice:</b> PatientTriage.ai is a clinical decision-support research prototype developed for the Accenture Innovation Challenge 2026. All patient cohorts are synthetically generated. This system is not a certified medical device and does not replace professional clinical judgment.", body_style)]]
    disc_table = Table(disc_data, colWidths=[7.5 * inch])
    disc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fffbeb')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#f59e0b')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(disc_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[OK] Generated submission PDF: {pdf_path} (Size: {os.path.getsize(pdf_path)} bytes)")

if __name__ == "__main__":
    build_pdf()
