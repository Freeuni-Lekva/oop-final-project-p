package com.quizapp.controller;

import com.quizapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private final UserService userService;

    @GetMapping("/login")
    public String showLoginForm(Model model) {
        return "login";
    }

    @GetMapping("/signup")
    public String showSignupForm(Model model) {
        return "signup";
    }

    @PostMapping("/signup")
    public String signup(@RequestParam String username, @RequestParam String password, Model model) {
        logger.info("Received signup request for username: {}", username);
        try {
            userService.register(username, password);
            logger.info("Successfully registered user: {}", username);
            return "redirect:/auth/login?registered=true";
        } catch (Exception e) {
            logger.error("Error during signup for user {}: {}", username, e.getMessage());
            model.addAttribute("error", "Registration failed: " + e.getMessage());
            return "signup";
        }
    }
}