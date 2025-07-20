package Finance.Tracker.Finance.Tracker.service;



import Finance.Tracker.Finance.Tracker.dto.BudgetDto;
import Finance.Tracker.Finance.Tracker.model.Budget;
import Finance.Tracker.Finance.Tracker.model.Category;
import Finance.Tracker.Finance.Tracker.model.User;
import Finance.Tracker.Finance.Tracker.repository.BudgetRepository;
import Finance.Tracker.Finance.Tracker.repository.CategoryRepository;
import Finance.Tracker.Finance.Tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    public List<BudgetDto> getBudgetsByMonth(Long userId, Integer month, Integer year) {
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
        return budgets.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<BudgetDto> getAllBudgets(Long userId) {
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        return budgets.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public BudgetDto createOrUpdateBudget(Long userId, BudgetDto budgetDto) {
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate category exists and belongs to user
        Category category = categoryRepository.findById(budgetDto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("Category does not belong to user");
        }

        // Check if budget already exists for this category, month, and year
        Optional<Budget> existingBudget = budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                userId, budgetDto.getCategoryId(), budgetDto.getMonth(), budgetDto.getYear());

        Budget budget;
        if (existingBudget.isPresent()) {
            // Update existing budget
            budget = existingBudget.get();
            budget.setAmount(budgetDto.getAmount());
        } else {
            // Create new budget
            budget = new Budget();
            budget.setUser(user);
            budget.setCategory(category);
            budget.setAmount(budgetDto.getAmount());
            budget.setMonth(budgetDto.getMonth());
            budget.setYear(budgetDto.getYear());
        }

        Budget savedBudget = budgetRepository.save(budget);
        return convertToDto(savedBudget);
    }

    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(userId)) {
            throw new RuntimeException("Budget does not belong to user");
        }

        budgetRepository.delete(budget);
    }

    public Optional<BudgetDto> getBudgetById(Long userId, Long budgetId) {
        Optional<Budget> budget = budgetRepository.findById(budgetId);

        if (budget.isPresent() && budget.get().getUser().getId().equals(userId)) {
            return Optional.of(convertToDto(budget.get()));
        }

        return Optional.empty();
    }

    private BudgetDto convertToDto(Budget budget) {
        BudgetDto dto = new BudgetDto();
        dto.setId(budget.getId());
        dto.setCategoryId(budget.getCategory().getId());
        dto.setCategoryName(budget.getCategory().getName());
        dto.setAmount(budget.getAmount());
        dto.setMonth(budget.getMonth());
        dto.setYear(budget.getYear());
        return dto;
    }
}