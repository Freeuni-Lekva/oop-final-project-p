package com.quizapp.serviceTests;

import com.quizapp.model.Message;
import com.quizapp.repository.MessageRepository;
import com.quizapp.service.MessageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @InjectMocks
    private MessageService messageService;

    @Test
    void testSendMessage_Success() {
        String sender = "sender";
        String receiver = "receiver";
        String content = "Hello!";
        Message message = new Message(sender, receiver, content, LocalDateTime.now());

        when(messageRepository.save(any(Message.class))).thenReturn(message);

        Message result = messageService.sendMessage(sender, receiver, content);

        assertNotNull(result);
        assertEquals(sender, result.getSenderUsername());
        assertEquals(receiver, result.getReceiverUsername());
        assertEquals(content, result.getContent());
        assertNotNull(result.getTimestamp());
        verify(messageRepository).save(any(Message.class));
    }

    @Test
    void testGetLatestMessagesForReceiver_Success() {
        String receiver = "receiver";
        List<Message> messages = List.of(
                new Message("sender1", receiver, "Hello!", LocalDateTime.now()),
                new Message("sender2", receiver, "Hi!", LocalDateTime.now().minusMinutes(1))
        );

        when(messageRepository.findLatestMessagesForReceiver(receiver)).thenReturn(messages);

        List<Message> result = messageService.getLatestMessagesForReceiver(receiver);

        assertEquals(2, result.size());
        assertEquals("sender1", result.get(0).getSenderUsername());
        assertEquals("sender2", result.get(1).getSenderUsername());
        verify(messageRepository).findLatestMessagesForReceiver(receiver);
    }
}