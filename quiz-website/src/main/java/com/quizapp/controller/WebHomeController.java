package com.quizapp.controller;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller
public class WebHomeController {
    private static final Logger logger = LoggerFactory.getLogger(WebHomeController.class);

    @GetMapping("/home")
    public String homePage(Model model, Authentication authentication) {
        logger.info("Accessing /home endpoint. Authentication: {}", authentication);
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            logger.info("Authenticated user: {}", username);
            model.addAttribute("username", username);
        } else {
            logger.warn("No authenticated user found");
        }
        return "home";
    }
}