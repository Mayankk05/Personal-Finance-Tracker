package Finance.Tracker.Finance.Tracker.controller;


import Finance.Tracker.Finance.Tracker.dto.BudgetDto;
import Finance.Tracker.Finance.Tracker.security.UserDetailsImpl;
import Finance.Tracker.Finance.Tracker.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetDto>> getBudgets(
            Authentication authentication,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        List<BudgetDto> budgets;
        if (month != null && year != null) {
            budgets = budgetService.getBudgetsByMonth(userId, month, year);
        } else {
            budgets = budgetService.getAllBudgets(userId);
        }

        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetDto> getBudgetById(
            Authentication authentication,
            @PathVariable Long id) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        Optional<BudgetDto> budget = budgetService.getBudgetById(userId, id);

        if (budget.isPresent()) {
            return ResponseEntity.ok(budget.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<BudgetDto> createOrUpdateBudget(
            Authentication authentication,
            @Valid @RequestBody BudgetDto budgetDto) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        BudgetDto savedBudget = budgetService.createOrUpdateBudget(userId, budgetDto);
        return ResponseEntity.ok(savedBudget);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            Authentication authentication,
            @PathVariable Long id) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        budgetService.deleteBudget(userId, id);
        return ResponseEntity.noContent().build();
    }
}