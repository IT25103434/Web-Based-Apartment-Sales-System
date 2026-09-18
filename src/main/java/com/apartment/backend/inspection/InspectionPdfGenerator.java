package com.apartment.backend.inspection;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

/**
 * Builds the downloadable inspection PDF report using the classic iText 5 API
 * (Document / Paragraph / PdfPTable) - the simplest PDF library API to read
 * and modify, which is why it was picked for this student project instead of
 * a more advanced templating approach.
 */
public class InspectionPdfGenerator {

    private static final Font TITLE_FONT = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
    private static final Font HEADING_FONT = new Font(Font.FontFamily.HELVETICA, 13, Font.BOLD);
    private static final Font NORMAL_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);
    private static final Font TABLE_HEADER_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);

    public static byte[] generate(Inspection inspection) {
        Document document = new Document(PageSize.A4, 40, 40, 50, 50);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, outputStream);
            document.open();

            // ---------- Title ----------
            Paragraph title = new Paragraph("Property Inspection Report", TITLE_FONT);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            // ---------- Listing / agent info ----------
            document.add(new Paragraph("Property: " + inspection.getListing().getTitle(), HEADING_FONT));
            document.add(new Paragraph("Address: " + inspection.getListing().getAddress() + ", " + inspection.getListing().getCity(), NORMAL_FONT));
            document.add(new Paragraph("Inspected by: " + inspection.getAgent().getFullName(), NORMAL_FONT));
            document.add(new Paragraph("Date: " + inspection.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")), NORMAL_FONT));
            if (inspection.getOverallScore() != null) {
                document.add(new Paragraph("Overall Condition Score: " + inspection.getOverallScore() + " / 10", NORMAL_FONT));
            }
            document.add(Chunk.NEWLINE);

            // ---------- Checklist table ----------
            document.add(new Paragraph("Inspection Checklist", HEADING_FONT));
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2f, 3f, 1.2f, 3f});

            addHeaderCell(table, "Category");
            addHeaderCell(table, "Description");
            addHeaderCell(table, "Score");
            addHeaderCell(table, "Remarks");

            for (InspectionItem item : inspection.getItems()) {
                table.addCell(new Phrase(item.getCategory(), NORMAL_FONT));
                table.addCell(new Phrase(item.getDescription(), NORMAL_FONT));
                table.addCell(new Phrase(String.valueOf(item.getConditionScore()), NORMAL_FONT));
                table.addCell(new Phrase(item.getRemarks() == null ? "-" : item.getRemarks(), NORMAL_FONT));
            }

            document.add(table);
            document.add(Chunk.NEWLINE);

            // ---------- General notes ----------
            if (inspection.getGeneralNotes() != null && !inspection.getGeneralNotes().isBlank()) {
                document.add(new Paragraph("General Notes / Repair Recommendations", HEADING_FONT));
                document.add(new Paragraph(inspection.getGeneralNotes(), NORMAL_FONT));
                document.add(Chunk.NEWLINE);
            }

            // ---------- Photos (listed by filename - actual thumbnails kept
            // out for simplicity, the photos remain viewable through the app) ----------
            if (inspection.getPhotos() != null && !inspection.getPhotos().isEmpty()) {
                document.add(new Paragraph("Attached Photos", HEADING_FONT));
                for (InspectionPhoto photo : inspection.getPhotos()) {
                    String caption = photo.getCaption() == null ? "" : " - " + photo.getCaption();
                    document.add(new Paragraph("• " + photo.getPhotoUrl() + caption, NORMAL_FONT));
                }
                document.add(Chunk.NEWLINE);
            }

            // ---------- Footer note ----------
            Paragraph footer = new Paragraph(
                    "This report was generated automatically by the Apartment Sales System and reflects the "
                            + "condition of the property at the time of inspection.",
                    new Font(Font.FontFamily.HELVETICA, 8, Font.ITALIC));
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate inspection PDF: " + e.getMessage(), e);
        }

        return outputStream.toByteArray();
    }

    private static void addHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, TABLE_HEADER_FONT));
        cell.setBackgroundColor(new BaseColor(52, 73, 94));
        cell.setPadding(6);
        table.addCell(cell);
    }
}
