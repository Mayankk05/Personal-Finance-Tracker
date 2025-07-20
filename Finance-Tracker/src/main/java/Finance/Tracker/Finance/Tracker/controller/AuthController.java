package Finance.Tracker.Finance.Tracker.controller;


import Finance.Tracker.Finance.Tracker.dto.LoginRequest;
import Finance.Tracker.Finance.Tracker.dto.RegisterRequest;
import Finance.Tracker.Finance.Tracker.service.AuthService;
import Finance.Tracker.Finance.Tracker.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private CategoryService categoryService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        Map<String, Object> response = authService.registerUser(registerRequest);

        if ((Boolean) response.get("success")) {
            // Create default categories for new user
            Long userId = (Long) response.get("userId");
            categoryService.createDefaultCategories(userId);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Map<String, Object> response = authService.authenticateUser(loginRequest);

        if ((Boolean) response.get("success")) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}