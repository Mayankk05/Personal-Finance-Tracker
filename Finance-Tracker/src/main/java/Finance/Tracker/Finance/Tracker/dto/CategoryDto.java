package Finance.Tracker.Finance.Tracker.dto;




import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CategoryDto {
    private Long id;

    @NotBlank(message = "Category name is required")
    private String name;

    @NotNull(message = "Category type is required")
    private TransactionType type;

    public CategoryDto() {}

    public CategoryDto(Long id, String name, TransactionType type) {
        this.id = id;
        this.name = name;
        this.type = type;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }
}
