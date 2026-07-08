package fca.unsm.config;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class LoginAttemptNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public LoginAttemptNotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void notificarIntento(String username) {
        messagingTemplate.convertAndSendToUser(
            username,
            "/queue/login-attempt",
            "Alguien intentó ingresar a tu cuenta mientras tu sesión estaba activa."
        );
    }
}