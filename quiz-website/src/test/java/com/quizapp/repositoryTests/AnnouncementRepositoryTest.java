package com.quizapp.repositoryTests;

import com.quizapp.model.Announcement;
import com.quizapp.repository.AnnouncementRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class AnnouncementRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Test
    void testSaveAnnouncement() {
        Announcement announcement = new Announcement();
        announcement.setTitle("Test Announcement");
        announcement.setContent("This is a test announcement");
        announcement.setCreatedAt(LocalDateTime.now());

        Announcement savedAnnouncement = announcementRepository.save(announcement);

        assertThat(savedAnnouncement).isNotNull();
        assertThat(savedAnnouncement.getId()).isNotNull();
        assertThat(savedAnnouncement.getTitle()).isEqualTo("Test Announcement");
        assertThat(savedAnnouncement.getContent()).isEqualTo("This is a test announcement");
    }

    @Test
    void testFindById() {
        Announcement announcement = new Announcement();
        announcement.setTitle("Test Announcement");
        announcement.setContent("Content");
        announcement.setCreatedAt(LocalDateTime.now());
        Long id = entityManager.persistAndGetId(announcement, Long.class);

        Optional<Announcement> foundAnnouncement = announcementRepository.findById(id);

        assertThat(foundAnnouncement).isPresent();
        assertThat(foundAnnouncement.get().getTitle()).isEqualTo("Test Announcement");
    }

    @Test
    void testFindById_NotFound() {
        Optional<Announcement> foundAnnouncement = announcementRepository.findById(999L);

        assertThat(foundAnnouncement).isNotPresent();
    }

    @Test
    void testFindAll() {
        Announcement announcement1 = new Announcement();
        announcement1.setTitle("Announcement 1");
        announcement1.setContent("Content 1");
        announcement1.setCreatedAt(LocalDateTime.now());
        Announcement announcement2 = new Announcement();
        announcement2.setTitle("Announcement 2");
        announcement2.setContent("Content 2");
        announcement2.setCreatedAt(LocalDateTime.now());

        entityManager.persist(announcement1);
        entityManager.persist(announcement2);

        List<Announcement> announcements = announcementRepository.findAll();

        assertThat(announcements).hasSize(2);
        assertThat(announcements).extracting(Announcement::getTitle).containsExactlyInAnyOrder("Announcement 1", "Announcement 2");
    }

    @Test
    void testDeleteById() {
        Announcement announcement = new Announcement();
        announcement.setTitle("Test Announcement");
        announcement.setContent("Content");
        announcement.setCreatedAt(LocalDateTime.now());
        Long id = entityManager.persistAndGetId(announcement, Long.class);

        announcementRepository.deleteById(id);

        Optional<Announcement> foundAnnouncement = announcementRepository.findById(id);
        assertThat(foundAnnouncement).isNotPresent();
    }

    @Test
    void testFindAllByOrderByCreatedAtDesc() {
        Announcement announcement1 = new Announcement();
        announcement1.setTitle("Announcement 1");
        announcement1.setContent("Content 1");
        announcement1.setCreatedAt(LocalDateTime.of(2023, 1, 1, 12, 0));
        Announcement announcement2 = new Announcement();
        announcement2.setTitle("Announcement 2");
        announcement2.setContent("Content 2");
        announcement2.setCreatedAt(LocalDateTime.of(2023, 1, 2, 12, 0));

        entityManager.persist(announcement1);
        entityManager.persist(announcement2);

        List<Announcement> announcements = announcementRepository.findAllByOrderByCreatedAtDesc();

        assertThat(announcements).hasSize(2);
        assertThat(announcements.get(0).getTitle()).isEqualTo("Announcement 2");
        assertThat(announcements.get(1).getTitle()).isEqualTo("Announcement 1");
    }

    @Test
    void testFindAllByOrderByCreatedAtDesc_Empty() {
        List<Announcement> announcements = announcementRepository.findAllByOrderByCreatedAtDesc();

        assertThat(announcements).isEmpty();
    }
}