package com.quizapp.repositoryTests;

import com.quizapp.model.Message;
import com.quizapp.repository.MessageRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class MessageRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private MessageRepository messageRepository;

    @Test
    void testSaveMessage() {
        Message message = new Message("sender", "receiver", "Hello!", LocalDateTime.now());

        Message savedMessage = messageRepository.save(message);

        assertThat(savedMessage).isNotNull();
        assertThat(savedMessage.getId()).isNotNull();
        assertThat(savedMessage.getSenderUsername()).isEqualTo("sender");
        assertThat(savedMessage.getReceiverUsername()).isEqualTo("receiver");
        assertThat(savedMessage.getContent()).isEqualTo("Hello!");
        assertThat(savedMessage.getTimestamp()).isNotNull();
    }

    @Test
    void testFindById() {
        Message message = new Message("sender", "receiver", "Hello!", LocalDateTime.now());
        Long id = entityManager.persistAndGetId(message, Long.class);

        Optional<Message> foundMessage = messageRepository.findById(id);

        assertThat(foundMessage).isPresent();
        assertThat(foundMessage.get().getSenderUsername()).isEqualTo("sender");
        assertThat(foundMessage.get().getContent()).isEqualTo("Hello!");
    }

    @Test
    void testFindLatestMessagesForReceiver() {
        Message message1 = new Message("sender1", "receiver", "Hello from sender1", LocalDateTime.of(2023, 1, 1, 12, 0));
        Message message2 = new Message("sender1", "receiver", "Latest from sender1", LocalDateTime.of(2023, 1, 2, 12, 0));
        Message message3 = new Message("sender2", "receiver", "Hello from sender2", LocalDateTime.of(2023, 1, 3, 12, 0));
        entityManager.persist(message1);
        entityManager.persist(message2);
        entityManager.persist(message3);

        List<Message> messages = messageRepository.findLatestMessagesForReceiver("receiver");

        assertThat(messages).hasSize(2);
        assertThat(messages).extracting(Message::getSenderUsername).containsExactlyInAnyOrder("sender1", "sender2");
        assertThat(messages).extracting(Message::getContent).containsExactlyInAnyOrder("Latest from sender1", "Hello from sender2");
    }

    @Test
    void testFindBySenderUsernameAndReceiverUsernameOrderByTimestampDesc() {
        Message message1 = new Message("sender", "receiver", "First message", LocalDateTime.of(2023, 1, 1, 12, 0));
        Message message2 = new Message("sender", "receiver", "Second message", LocalDateTime.of(2023, 1, 2, 12, 0));
        entityManager.persist(message1);
        entityManager.persist(message2);

        List<Message> messages = messageRepository.findBySenderUsernameAndReceiverUsernameOrderByTimestampDesc("sender", "receiver");

        assertThat(messages).hasSize(2);
        assertThat(messages.get(0).getContent()).isEqualTo("Second message");
        assertThat(messages.get(1).getContent()).isEqualTo("First message");
    }
}