package com.example.backend.controller;

import com.example.backend.model.Activity;
import com.example.backend.model.User;
import com.example.backend.repository.ActivityRepository;
import com.example.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.awt.*;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;

    public CertificateController(UserRepository userRepository, ActivityRepository activityRepository) {
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
    }

    @GetMapping("/teacher/{teacherId}/student/{studentId}")
    public void downloadTeacherCertificate(@PathVariable Long teacherId,
                                           @PathVariable Long studentId,
                                           HttpServletResponse response) throws IOException {
        User teacher = userRepository.findById(teacherId).orElseThrow();
        User student = userRepository.findById(studentId).orElseThrow();
        List<Activity> activities = activityRepository.findByTeacher(teacher);

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=certificado-" + studentId + "-" + teacherId + ".pdf");

        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);
            PDPageContentStream cs = new PDPageContentStream(doc, page);

            // Fondo con líneas de colores (estilo simple y más ancho)
            float width = page.getMediaBox().getWidth();
            float height = page.getMediaBox().getHeight();
            drawStripe(cs, width, height, 20, new Color(16, 152, 125));
            drawStripe(cs, width, height, 38, new Color(0, 160, 220));
            drawStripe(cs, width, height, 56, new Color(72, 61, 221));
            drawStripe(cs, width, height, 74, new Color(180, 225, 240));
            drawStripe(cs, width, height, 92, new Color(160, 210, 50));

            // Logo centrado
            try {
                PDImageXObject logo = PDImageXObject.createFromFileByContent(
                        getClass().getResourceAsStream(\"/static/pictures/pythonlogin.png\"), doc);
                float logoW = 80;
                float logoH = logo.getHeight() * (logoW / logo.getWidth());
                float logoX = (width - logoW) / 2f;
                float logoY = height - 140;
                cs.drawImage(logo, logoX, logoY, logoW, logoH);

                // Texto PythPal bajo el logo
                String brand = \"PythPal\";
                float brandSize = 14f;
                float brandWidth = PDType1Font.HELVETICA_BOLD.getStringWidth(brand) / 1000f * brandSize;
                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, brandSize);
                cs.newLineAtOffset((width - brandWidth) / 2f, logoY - 12);
                cs.showText(brand);
                cs.endText();
            } catch (Exception ignore) {}

            // Título
            String title = \"PythPal certifica que el estudiante:\";
            float titleSize = 24f;
            float titleWidth = PDType1Font.HELVETICA_BOLD.getStringWidth(title) / 1000f * titleSize;
            cs.beginText();
            cs.setFont(PDType1Font.HELVETICA_BOLD, titleSize);
            cs.newLineAtOffset((width - titleWidth) / 2f, height - 190);
            cs.showText(title);
            cs.endText();

            // Nombre estudiante
            String studentName = student.getName() != null ? student.getName() : student.getEmail();
            float nameSize = 36f;
            float nameWidth = PDType1Font.HELVETICA_BOLD.getStringWidth(studentName) / 1000f * nameSize;
            cs.beginText();
            cs.setFont(PDType1Font.HELVETICA_BOLD, nameSize);
            cs.newLineAtOffset((width - nameWidth) / 2f, height - 240);
            cs.showText(studentName);
            cs.endText();

            // Cuerpo
            String body = \"Completó satisfactoriamente todos los ejercicios propuestos por el profesor:\";
            float bodySize = 16f;
            float bodyWidth = PDType1Font.HELVETICA.getStringWidth(body) / 1000f * bodySize;
            cs.beginText();
            cs.setFont(PDType1Font.HELVETICA, bodySize);
            cs.newLineAtOffset((width - bodyWidth) / 2f, height - 290);
            cs.showText(body);
            cs.endText();

            String teacherName = teacher.getName() != null ? teacher.getName() : teacher.getEmail();
            float teacherSize = 22f;
            float teacherWidth = PDType1Font.HELVETICA_BOLD.getStringWidth(teacherName) / 1000f * teacherSize;
            cs.beginText();
            cs.setFont(PDType1Font.HELVETICA_BOLD, teacherSize);
            cs.newLineAtOffset((width - teacherWidth) / 2f, height - 325);
            cs.showText(teacherName);
            cs.endText();

            String date = \"Fecha: \" + LocalDate.now();
            float dateSize = 14f;
            float dateWidth = PDType1Font.HELVETICA_OBLIQUE.getStringWidth(date) / 1000f * dateSize;
            cs.beginText();
            cs.setFont(PDType1Font.HELVETICA_OBLIQUE, dateSize);
            cs.newLineAtOffset((width - dateWidth) / 2f, height - 370);
            cs.showText(date);
            cs.endText();

            cs.close();
            doc.save(response.getOutputStream());
        }
    }

    private void drawStripe(PDPageContentStream cs, float width, float height, float offset, Color color) throws IOException {
        cs.setStrokingColor(color);
        cs.setLineWidth(14f);
        cs.moveTo(0, height - offset);
        cs.lineTo(width, height - (offset + 40));
        cs.stroke();
    }
}

