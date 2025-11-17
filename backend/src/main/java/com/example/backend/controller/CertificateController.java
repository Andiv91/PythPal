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

            // Fondo con líneas de colores (estilo simple)
            float width = page.getMediaBox().getWidth();
            float height = page.getMediaBox().getHeight();
            drawStripe(cs, width, height, 20, new Color(16, 152, 125));   // verde
            drawStripe(cs, width, height, 40, new Color(0, 160, 220));    // celeste
            drawStripe(cs, width, height, 60, new Color(72, 61, 221));    // violeta
            drawStripe(cs, width, height, 80, new Color(180, 225, 240));  // azul claro
            drawStripe(cs, width, height, 100, new Color(160, 210, 50));  // lima

            // Título
            cs.beginText();
            cs.setFont(PDType1Font.HELVETICA_BOLD, 22);
            cs.newLineAtOffset(70, height - 120);
            cs.showText("PythPal certifica que el estudiante:");
            cs.endText();

            // Nombre estudiante
            cs.beginText();
            cs.setFont(PDType1Font.HELVETICA_BOLD, 28);
            cs.newLineAtOffset(70, height - 160);
            cs.showText(student.getName() != null ? student.getName() : student.getEmail());
            cs.endText();

            // Cuerpo
            cs.beginText();
            cs.setFont(PDType1Font.HELVETICA, 16);
            cs.newLineAtOffset(70, height - 200);
            cs.showText("Completó satisfactoriamente todos los ejercicios propuestos por el profesor:");
            cs.endText();

            cs.beginText();
            cs.setFont(PDType1Font.HELVETICA_BOLD, 20);
            cs.newLineAtOffset(70, height - 230);
            cs.showText(teacher.getName() != null ? teacher.getName() : teacher.getEmail());
            cs.endText();

            cs.beginText();
            cs.setFont(PDType1Font.HELVETICA_OBLIQUE, 14);
            cs.newLineAtOffset(70, height - 270);
            cs.showText("Fecha: " + LocalDate.now());
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

