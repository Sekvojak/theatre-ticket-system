package com.theatre.backend.service;

import com.theatre.backend.entity.Performance;
import com.theatre.backend.entity.Reservation;
import com.theatre.backend.entity.Ticket;
import com.theatre.backend.entity.User;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ─── Verifikácia účtu ─────────────────────────────────────────────────────

    @Async
    public void sendVerificationEmail(User user) {
        String link = frontendUrl + "/verify?token=" + user.getVerificationToken();
        String html = baseTemplate(
            "Overte svoj účet",
            user.getName(),
            """
            <p style="color:#b0b0b0;font-size:15px;line-height:1.7;margin:0 0 24px;">
              Ďakujeme za registráciu v Kláre. Kliknite na tlačidlo nižšie a overte svoju e-mailovú adresu.
              Bez overenia sa nebudete môcť prihlásiť.
            </p>
            """,
            link,
            "Overiť e-mail",
            "Odkaz je platný 24 hodín. Ak ste si účet nezaložili vy, tento email ignorujte."
        );
        send(user.getEmail(), "Klára — Overte svoj účet", html);
    }

    // ─── Potvrdenie rezervácie ────────────────────────────────────────────────

    @Async
    public void sendReservationConfirmation(Reservation reservation, List<Ticket> tickets) {
        String email = resolveEmail(reservation);
        String name  = resolveName(reservation);
        if (email == null) return;

        Performance perf = reservation.getPerformance();
        String showTitle = perf.getShow().getTitle();
        String date = formatDateTime(perf);
        String hall = perf.getHall().getName();
        String seatList = tickets.stream()
                .map(t -> "Rad " + t.getSeat().getRowNumber() + ", Sedadlo " + t.getSeat().getSeatNumber())
                .reduce((a, b) -> a + "<br>" + b)
                .orElse("—");
        double total = tickets.stream().mapToDouble(Ticket::getPrice).sum();

        String body = """
            <p style="color:#b0b0b0;font-size:15px;line-height:1.7;margin:0 0 20px;">
              Vaša rezervácia bola úspešne vytvorená. Tu sú detaily:
            </p>
            """ + infoBox(new String[][]{
                {"Inscenácia", showTitle},
                {"Dátum a čas", date},
                {"Sála", hall},
                {"Sedadlá", seatList},
                {"Celková cena", String.format(Locale.FRANCE, "%.2f €", total)},
                {"Číslo rezervácie", "#" + reservation.getId()},
        }) + """
            <p style="color:#888;font-size:13px;margin-top:20px;">
              Prineste prosím číslo rezervácie na vstup. Tešíme sa na vás!
            </p>
            """;

        String html = baseTemplate("Potvrdenie rezervácie", name, body, null, null,
                "Ak ste rezerváciu nevykonali vy, kontaktujte nás.");
        send(email, "Klára — Potvrdenie rezervácie #" + reservation.getId(), html);
    }

    // ─── Zrušenie rezervácie ──────────────────────────────────────────────────

    @Async
    public void sendReservationCancellation(Reservation reservation) {
        String email = resolveEmail(reservation);
        String name  = resolveName(reservation);
        if (email == null) return;

        Performance perf = reservation.getPerformance();
        String showTitle = perf.getShow().getTitle();
        String date = formatDateTime(perf);

        String body = """
            <p style="color:#b0b0b0;font-size:15px;line-height:1.7;margin:0 0 20px;">
              Vaša rezervácia bola zrušená. Dúfame, že sa uvidíme nabudúce!
            </p>
            """ + infoBox(new String[][]{
                {"Inscenácia", showTitle},
                {"Dátum a čas", date},
                {"Číslo rezervácie", "#" + reservation.getId()},
        });

        String html = baseTemplate("Rezervácia bola zrušená", name, body, null, null,
                "Ak ste rezerváciu nezrušili vy, kontaktujte nás.");
        send(email, "Klára — Zrušenie rezervácie #" + reservation.getId(), html);
    }

    // ─── Zrušenie predstavenia ────────────────────────────────────────────────

    @Async
    public void sendPerformanceCancellation(Reservation reservation, Performance performance) {
        String email = resolveEmail(reservation);
        String name  = resolveName(reservation);
        if (email == null) return;

        String showTitle = performance.getShow().getTitle();
        String date = formatDateTime(performance);

        String body = """
            <p style="color:#b0b0b0;font-size:15px;line-height:1.7;margin:0 0 20px;">
              S ľútosťou vám oznamujeme, že predstavenie, na ktoré ste mali rezerváciu, bolo zrušené.
              Ospravedlňujeme sa za spôsobené nepríjemnosti.
            </p>
            """ + infoBox(new String[][]{
                {"Inscenácia", showTitle},
                {"Pôvodný termín", date},
                {"Číslo rezervácie", "#" + reservation.getId()},
        }) + """
            <p style="color:#b0b0b0;font-size:14px;margin-top:20px;line-height:1.6;">
              Ak ste platili vopred, refundácia bude spracovaná do 5–7 pracovných dní.<br>
              Pre ďalšie informácie nás neváhajte kontaktovať.
            </p>
            """;

        String html = baseTemplate("Predstavenie bolo zrušené", name, body, frontendUrl + "/shows",
                "Pozrieť iné predstavenia",
                "Tento email bol zaslaný automaticky z dôvodu zmeny v programe.");
        send(email, "Klára — Predstavenie " + showTitle + " bolo zrušené", html);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private void send(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom("Klára Divadlo <" + fromEmail + ">");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
            log.info("Email sent to {} — {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String resolveEmail(Reservation r) {
        if (r.getUser() != null) return r.getUser().getEmail();
        return r.getGuestEmail();
    }

    private String resolveName(Reservation r) {
        if (r.getUser() != null) return r.getUser().getName();
        return r.getGuestName() != null ? r.getGuestName() : "Vážený zákazník";
    }

    private String formatDateTime(Performance p) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("d. MMMM yyyy 'o' HH:mm", new Locale("sk"));
        return p.getStartTime().format(fmt);
    }

    // ─── HTML template ────────────────────────────────────────────────────────

    private String baseTemplate(String title, String recipientName, String bodyContent,
                                 String ctaUrl, String ctaLabel, String footerNote) {
        String cta = (ctaUrl != null && ctaLabel != null) ? """
            <div style="text-align:center;margin:32px 0;">
              <a href="%s"
                 style="background:#c19a6b;color:#07090f;text-decoration:none;padding:14px 36px;
                        border-radius:2px;font-size:14px;font-weight:600;letter-spacing:1px;
                        text-transform:uppercase;display:inline-block;">
                %s
              </a>
            </div>
            """.formatted(ctaUrl, ctaLabel) : "";

        return """
            <!DOCTYPE html>
            <html lang="sk">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
            <body style="margin:0;padding:0;background:#07090f;font-family:'Helvetica Neue',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#07090f;padding:40px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0"
                         style="max-width:600px;background:#0d0f18;border:1px solid #1e2030;border-radius:4px;overflow:hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#1a1520 0%%,#0d0f18 100%%);
                                 padding:36px 40px;border-bottom:1px solid #1e2030;text-align:center;">
                        <div style="font-family:Georgia,serif;font-size:28px;color:#c19a6b;
                                    letter-spacing:4px;font-weight:400;">KLÁRA</div>
                        <div style="color:#555;font-size:11px;letter-spacing:3px;margin-top:4px;text-transform:uppercase;">
                          Divadlo &amp; Kino
                        </div>
                      </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                      <td style="padding:40px;">
                        <h1 style="font-family:Georgia,serif;color:#e8e0d0;font-size:24px;
                                   font-weight:400;margin:0 0 8px;">%s</h1>
                        <p style="color:#c19a6b;font-size:13px;letter-spacing:1px;
                                  text-transform:uppercase;margin:0 0 28px;">Dobrý deň, %s</p>
                        %s
                        %s
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="background:#09090f;border-top:1px solid #1e2030;
                                 padding:24px 40px;text-align:center;">
                        <p style="color:#444;font-size:12px;margin:0 0 8px;">%s</p>
                        <p style="color:#333;font-size:11px;margin:0;">
                          © 2025 Klára Divadlo &amp; Kino · Všetky práva vyhradené
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(title, recipientName, bodyContent, cta, footerNote != null ? footerNote : "");
    }

    private String infoBox(String[][] rows) {
        StringBuilder sb = new StringBuilder();
        sb.append("<table width=\"100%%\" cellpadding=\"0\" cellspacing=\"0\" ")
          .append("style=\"border:1px solid #1e2030;border-radius:2px;margin:0 0 20px;\">");
        for (int i = 0; i < rows.length; i++) {
            String bg = i % 2 == 0 ? "#0a0c15" : "#0d0f18";
            sb.append("<tr style=\"background:").append(bg).append(";\">")
              .append("<td style=\"padding:12px 16px;color:#666;font-size:13px;width:40%%;border-bottom:1px solid #1a1c25;\">")
              .append(rows[i][0]).append("</td>")
              .append("<td style=\"padding:12px 16px;color:#d0c8b8;font-size:13px;border-bottom:1px solid #1a1c25;\">")
              .append(rows[i][1]).append("</td>")
              .append("</tr>");
        }
        sb.append("</table>");
        return sb.toString();
    }
}
