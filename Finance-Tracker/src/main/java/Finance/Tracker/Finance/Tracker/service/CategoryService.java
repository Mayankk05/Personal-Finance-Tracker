package Finance.Tracker.Finance.Tracker.service;

import Finance.Tracker.Finance.Tracker.dto.CategoryDto;
import Finance.Tracker.Finance.Tracker.dto.TransactionType;
import Finance.Tracker.Finance.Tracker.model.Category;
import Finance.Tracker.Finance.Tracker.model.User;
import Finance.Tracker.Finance.Tracker.repository.CategoryRepository;
import Finance.Tracker.Finance.Tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CategoryDto> getAllCategories(Long userId) {
        List<Category> categories = categoryRepository.findByUserIdOrderByName(userId);
        return categories.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<CategoryDto> getCategoriesByType(Long userId, TransactionType type) {
        List<Category> categories = categoryRepository.findByUserIdAndType(userId, type);
        return categories.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public CategoryDto createCategory(Long userId, CategoryDto categoryDto) {
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if category name already exists for this user
        if (categoryRepository.existsByNameAndUserId(categoryDto.getName(), userId)) {
            throw new RuntimeException("Category with this name already exists");
        }

        // Create category
        Category category = new Category();
        category.setName(categoryDto.getName());
        category.setType(categoryDto.getType());
        category.setUser(user);

        Category savedCategory = categoryRepository.save(category);
        return convertToDto(savedCategory);
    }

    public CategoryDto updateCategory(Long userId, Long categoryId, CategoryDto categoryDto) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Validate category belongs to user
        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("Category does not belong to user");
        }

        // Check if new name conflicts with existing categories
        if (!category.getName().equals(categoryDto.getName()) &&
                categoryRepository.existsByNameAndUserId(categoryDto.getName(), userId)) {
            throw new RuntimeException("Category with this name already exists");
        }

        // Update fields
        if (categoryDto.getName() != null) {
            category.setName(categoryDto.getName());
        }
        if (categoryDto.getType() != null) {
            category.setType(categoryDto.getType());
        }

        Category updatedCategory = categoryRepository.save(category);
        return convertToDto(updatedCategory);
    }

    public void deleteCategory(Long userId, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("Category does not belong to user");
        }

        categoryRepository.delete(category);
    }

    public Optional<CategoryDto> getCategoryById(Long userId, Long categoryId) {
        Optional<Category> category = categoryRepository.findById(categoryId);

        if (category.isPresent() && category.get().getUser().getId().equals(userId)) {
            return Optional.of(convertToDto(category.get()));
        }

        return Optional.empty();
    }

    public void createDefaultCategories(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Default expense categories
        String[] expenseCategories = {"Food", "Transport", "Entertainment", "Shopping", "Bills", "Healthcare"};
        for (String categoryName : expenseCategories) {
            if (!categoryRepository.existsByNameAndUserId(categoryName, userId)) {
                Category category = new Category(categoryName, TransactionType.EXPENSE, user);
                categoryRepository.save(category);
            }
        }

        // Default income categories
        String[] incomeCategories = {"Salary", "Freelance", "Investment", "Other Income"};
        for (String categoryName : incomeCategories) {
            if (!categoryRepository.existsByNameAndUserId(categoryName, userId)) {
                Category category = new Category(categoryName, TransactionType.INCOME, user);
                categoryRepository.save(category);
            }
        }
    }

    private CategoryDto convertToDto(Category category) {
        return new CategoryDto(category.getId(), category.getName(), category.getType());
    }
}