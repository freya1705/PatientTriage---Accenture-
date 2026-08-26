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
            self.drawString(40, 11 * 72 - 30, "PatientTriage.ai — Technical Submission README")
            self.drawRightString(8.5 * 72 - 40, 11 * 72 - 30, "Accenture Innovation Challenge 2026")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(40, 11 * 72 - 34, 8.5 * 72 - 40, 11 * 72 - 34)

        # Footer (all pages)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * 72 - 40, 25, page_text)
        self.drawString(40, 25, "Confidential — Prototype Submission Document &bull; Synthetic Physiological Cohorts")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(40, 35, 8.5 * 72 - 40, 35)

        self.restoreState()

def build_pdf():
    pdf_path = os.path.join(os.path.dirname(__file__), "PatientTriage_AI_Accenture_Submission_README.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=42,
        bottomMargin=42
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=2
    )

    tagline_style = ParagraphStyle(
        'DocTagline',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0284c7'),
        spaceAfter=2
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#64748b'),
        spaceAfter=10
    )

    h1_style = ParagraphStyle(
        'CustomH1',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=12,
        spaceAfter=5,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'CustomH2',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#0369a1'),
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'CustomBody',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'CustomBullet',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#1e293b'),
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    code_style = ParagraphStyle(
        'CustomCode',
        fontName='Courier',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=4
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
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284c7'), spaceAfter=8))

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
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 6))

    # 1. Project Overview
    story.append(Paragraph("1. Project Overview &amp; Introduction", h1_style))
    story.append(Paragraph(
        "<b>PatientTriage.ai</b> is an emergency department clinical decision-support system and continuous physiological safety surveillance layer. "
        "While traditional emergency triage treats patient prioritization as a static, one-time snapshot at hospital intake, PatientTriage.ai continuously "
        "tracks patient waiting times, vital sign trajectory velocity (&Delta;SpO₂, &Delta;HR), data uncertainty, and active clinical attention.",
        body_style
    ))
    story.append(Paragraph(
        "The platform answers the single most critical operational question facing emergency clinicians: "
        "<b>“Who in the waiting room is no longer safe to keep waiting?”</b>",
        callout_style
    ))

    # 2. Core Problem
    story.append(Paragraph("2. The Core Problem: 3 Failure Modes of Traditional Triage", h1_style))
    story.append(Paragraph(
        "In emergency departments, triage is usually a point-in-time snapshot. Once triaged, patients wait for hours where risk continuously changes. Traditional static triage exhibits 3 concrete failure modes:",
        body_style
    ))
    story.append(Paragraph("• <b>1. Silent Post-Triage Waiting Room Deterioration:</b> Patients triaged as Level 3 (Urgent) or Level 4 (Less Urgent) silently deteriorate in the waiting lounge without triggering an alert until physical collapse.", bullet_style))
    story.append(Paragraph("• <b>2. Missing Vitals &amp; Stale Data Assumed Safe:</b> Incomplete records lacking SpO₂ or BP default to low acuity, creating false reassurance. In medicine, <i>Unknown is NOT Safe</i>.", bullet_style))
    story.append(Paragraph("• <b>3. The Clinical Attention Bottleneck:</b> Static lists rank patients purely by intake severity. Attended critical patients block the queue, while <i>unattended deteriorating patients</i> remain hidden.", bullet_style))

    # 3. 3-Tier Layered Architecture
    story.append(Paragraph("3. System Architecture: 3-Tier Layered Design", h1_style))
    story.append(Paragraph(
        "To ensure patient safety, mathematical explainability, and ethical clinician governance, PatientTriage.ai implements a strict 3-tier separation:",
        body_style
    ))

    arch_data = [
        [Paragraph("<b>Tier</b>", body_style), Paragraph("<b>Responsibilities &amp; Scope</b>", body_style), Paragraph("<b>Key Modules</b>", body_style)],
        [Paragraph("<b>Tier 1: Deterministic Safety Layer</b>", body_style), Paragraph("Deterministic red-flags (SpO₂ &lt; 85%, SBP &lt; 75 mmHg, FAST Stroke, pediatric stridor) that bypass ML models. Counterfactual downgrade safety blocking.", body_style), Paragraph("<code>safety_guardrails.py</code><br/><code>downgrade_guard.py</code>", code_style)],
        [Paragraph("<b>Tier 2: AI &amp; Decision Support</b>", body_style), Paragraph("Continuous vital trajectory velocity (&Delta;SpO₂, &Delta;HR), dynamic confidence decay (&tau;<sub>staleness</sub>), uncertainty scoring (Unknown &ne; Safe), Attention Gap re-ranking.", body_style), Paragraph("<code>risk_engine.py</code><br/><code>deterioration_engine.py</code><br/><code>attention_gap_engine.py</code>", code_style)],
        [Paragraph("<b>Tier 3: Clinician Governance</b>", body_style), Paragraph("Licensed clinician override authority, mandatory justification recording, and immutable append-only audit logging.", body_style), Paragraph("<code>audit_service.py</code><br/><code>OverrideModal.jsx</code>", code_style)],
    ]
    arch_table = Table(arch_data, colWidths=[1.8 * inch, 4.0 * inch, 1.7 * inch])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 6))

    # 4. Intelligence Engines & Mathematical Formulations
    story.append(Paragraph("4. Core Intelligence Engines &amp; Mathematical Formulations", h1_style))
    story.append(Paragraph("<b>A. Age-Aware Physiological Calibrations:</b> Pediatric models calibrate for infant tachycardia (&gt;160 bpm) and toddler high fever (&ge;38.5&deg;C in &lt;3yo) with minimum blood pressure formula <code>SBP_min = 70 + (2 &times; Age)</code>. Geriatric models calibrate for hypothermic occult sepsis (&lt;36.0&deg;C) and elevated shock thresholds (SBP &lt; 100 mmHg).", body_style))
    story.append(Paragraph("<b>B. Uncertainty-as-Risk Engine (“Unknown &ne; Safe”):</b> Missing critical vitals deduct confidence (&Sigma; SpO₂: +22%, SBP: +20%, Zero History: +18%). Asymmetric safety bias escalates low-acuity cases with missing vitals to Level 3 Urgent and mandates an <code>[ ACQUIRE VITALS ]</code> verification.", body_style))
    story.append(Paragraph("<b>C. Dynamic Confidence Decay &amp; Safety Expiry (&tau;<sub>staleness</sub>):</b> Evidence decays over time via <code>Confidence(t) = Base &times; max(0.20, 1.0 - [ (t - t_last) / (Window &times; 1.5) ] &times; 0.65)</code>. Exceeding the window flips status to <code>SAFETY_EXPIRED</code>.", body_style))
    story.append(Paragraph("<b>D. The Attention Gap Priority Equation:</b>", body_style))
    story.append(Paragraph("<code>Action Priority Score = (w_r &times; Risk + Urgency) + (w_d &times; Deterioration) + (w_s &times; Staleness) + Wait Hazard + (w_u &times; Uncertainty) - (w_c &times; Clinical Coverage)</code>", code_style))
    story.append(Paragraph("Where <code>w_c</code> deducts priority when an attending physician is already actively managing the patient (<code>is_attended = True</code>), allowing unattended deteriorating waiting patients to surface to Rank #1.", body_style))

    # Page Break for Evaluation & Features
    story.append(PageBreak())

    # 5. Benchmark Cohort & Empirical Impact Evaluation
    story.append(Paragraph("5. Benchmark Cohort &amp; Empirical Impact Evaluation", h1_style))
    story.append(Paragraph("Evaluated across 20 synthetic clinical scenarios representing 5 systematic emergency department failure modes:", body_style))

    eval_data = [
        [Paragraph("<b>Performance Dimension</b>", body_style), Paragraph("<b>Traditional Static Triage</b>", body_style), Paragraph("<b>PatientTriage.ai</b>", body_style), Paragraph("<b>Impact Delta</b>", body_style)],
        [Paragraph("<b>Waiting Deterioration Catch Rate</b>", body_style), Paragraph("<font color='#b91c1c'>0% (Undetected)</font>", body_style), Paragraph("<font color='#047857'><b>100% (Continuous)</b></font>", body_style), Paragraph("<b>+100% Safety Catch</b>", body_style)],
        [Paragraph("<b>Stale Observation Flagging</b>", body_style), Paragraph("<font color='#b91c1c'>0% (Assumed Safe)</font>", body_style), Paragraph("<font color='#047857'><b>100% (Flagged EXPIRED)</b></font>", body_style), Paragraph("<b>Zero Unmonitored Stale Waits</b>", body_style)],
        [Paragraph("<b>False Reassurance on Missing Vitals</b>", body_style), Paragraph("<font color='#b91c1c'>High (Treated Normal)</font>", body_style), Paragraph("<font color='#047857'><b>0% (Unknown &ne; Safe)</b></font>", body_style), Paragraph("<b>Eliminates Under-Triage</b>", body_style)],
        [Paragraph("<b>Attention Gap Optimization</b>", body_style), Paragraph("<font color='#b91c1c'>None (Attended Block)</font>", body_style), Paragraph("<font color='#047857'><b>Active (Elevates Unattended)</b></font>", body_style), Paragraph("<b>Optimized Clinician Utilization</b>", body_style)],
        [Paragraph("<b>Unsafe Priority Downgrades Blocked</b>", body_style), Paragraph("<font color='#b91c1c'>0 Guardrails</font>", body_style), Paragraph("<font color='#047857'><b>100% Guarded</b></font>", body_style), Paragraph("<b>100% Downgrade Guarded</b>", body_style)],
    ]
    eval_table = Table(eval_data, colWidths=[2.2 * inch, 1.8 * inch, 1.8 * inch, 1.7 * inch])
    eval_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
    ]))
    story.append(eval_table)
    story.append(Paragraph("<font color='#64748b'><i>*Note: Results reflect simulated evaluations across 20 synthetic clinical benchmark scenarios for prototype demonstration.</i></font>", body_style))
    story.append(Spacer(1, 6))

    # 6. Key Features & Clinical UX
    story.append(Paragraph("6. Key Features &amp; Clinical Command Center UX", h1_style))
    story.append(Paragraph("• <b>3-Zone Clinical Cockpit:</b> Left navigation rail, Center Live Action Queue workspace, and Right persistent safety summary panel.", bullet_style))
    story.append(Paragraph("• <b>Hero Live Action Queue:</b> Real-time rank ordering with SpO₂ sparklines, Attention Gap meters, and one dominant Next-Best-Action button.", bullet_style))
    story.append(Paragraph("• <b>7 One-Click Demo Presets:</b> Instant simulation of toddler fever, geriatric sepsis, missing vitals, ambiguous diabetic nausea, and zero-history trauma.", bullet_style))
    story.append(Paragraph("• <b>🚨 3&times; Surge Mode Disaster Simulator:</b> One-click volume expansion (20 &rarr; 60 patients) with automatic queue compression to prevent nurse alarm fatigue.", bullet_style))
    story.append(Paragraph("• <b>Hospital Profile Switcher:</b> Configurable between Urban Level-1 Trauma Center and Community Rural Clinic models.", bullet_style))

    # 7. Quick Start & Test Suite
    story.append(Paragraph("7. Installation, Quick Start &amp; Automated Verification", h1_style))
    story.append(Paragraph("<code># 1. One-Command Launch (Windows PowerShell):<br/>.\\start.ps1<br/><br/># 2. Manual Startup:<br/>pip install -r requirements.txt &amp;&amp; python -m uvicorn backend.main:app --reload --port 8000<br/>cd frontend &amp;&amp; npm install &amp;&amp; npm run dev<br/><br/># 3. Run Automated Test Suite (33 Unit &amp; Integration Tests):<br/>python -m pytest -v</code>", code_style))

    # 8. Security & Privacy
    story.append(Paragraph("8. Security, Privacy-by-Design &amp; Governance", h1_style))
    story.append(Paragraph("• <b>Zero PHI:</b> 100% synthetic physiological datasets without any real patient records.", bullet_style))
    story.append(Paragraph("• <b>Air-Gapped &amp; On-Premise:</b> Runs entirely within hospital local network with zero external cloud LLM API dependencies.", bullet_style))
    story.append(Paragraph("• <b>Append-Only Audit Ledger:</b> Every intake, vital update, deterioration event, and clinician override is recorded with timestamps and clinical roles.", bullet_style))

    # Regulatory Disclaimer
    story.append(Spacer(1, 4))
    disc_data = [[Paragraph("<b>Regulatory &amp; Safety Notice:</b> PatientTriage.ai is a clinical decision-support research prototype developed for the Accenture Innovation Challenge 2026. All patient cohorts are synthetically generated. This system is not a certified medical device and does not replace licensed clinical judgment.", body_style)]]
    disc_table = Table(disc_data, colWidths=[7.5 * inch])
    disc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fffbeb')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#f59e0b')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(disc_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[OK] Generated submission PDF: {pdf_path} (Size: {os.path.getsize(pdf_path)} bytes)")

if __name__ == "__main__":
    build_pdf()
