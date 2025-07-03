package com.quizapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "achievements")
@Getter
@Setter
@NoArgsConstructor
public class Achievement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // e.g. "AMATEUR_AUTHOR"

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    private String icon; // icon name or URL
} 