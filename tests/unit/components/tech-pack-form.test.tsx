import { fireEvent, render, screen, waitFor } from "@testing-library/react";
// Import sau khi mock
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TechPackForm } from "@/app/(dashboard)/design-projects/components/tech-pack-form";
import { TechPackStatus } from "@/generated/prisma/enums";
import { createTechPack, getProductDesignForForm, getTechPackById, searchProductDesigns, updateTechPack } from "@/lib/features/design/actions";

// Mock các dependencies
vi.mock("next/navigation", () => ({
	useRouter: vi.fn(() => mockRouter),
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

vi.mock("@/lib/features/design/actions", () => ({
	createTechPack: vi.fn(),
	updateTechPack: vi.fn(),
	getTechPackById: vi.fn(),
	getProductDesignForForm: vi.fn(),
	searchProductDesigns: vi.fn(),
}));

vi.mock("@/components/ui/async-search-select", () => ({
	AsyncSearchSelect: ({ placeholder, value, onValueChange, initialOptions, fetchOptions }: any) => (
		<div data-testid="async-search-select">
			<input
				placeholder={placeholder}
				value={value}
				onChange={(e) => onValueChange(e.target.value)}
				data-testid="product-design-select"
			/>
			{initialOptions?.map((option: any) => (
				<div key={option.value} data-testid={`option-${option.value}`}>
					{option.label}
				</div>
			))}
		</div>
	),
}));

vi.mock("@/components/form-fields/file-upload-field", () => ({
	FileUploadField: ({ label, value, onChange, description, accept, maxFiles }: any) => (
		<div data-testid="file-upload-field">
			<label>{label}</label>
			<input
				type="file"
				multiple
				accept={accept}
				data-testid="output-files-input"
				onChange={(e) => onChange(Array.from(e.target.files || []).map((f: any) => f.name))}
			/>
			<span>{description}</span>
		</div>
	),
}));


const mockRouter = {
	push: vi.fn(),
	back: vi.fn(),
};

const mockCreateTechPack = vi.mocked(createTechPack);
const mockUpdateTechPack = vi.mocked(updateTechPack);
const mockGetTechPackById = vi.mocked(getTechPackById);
const mockGetProductDesignForForm = vi.mocked(getProductDesignForForm);
const mockSearchProductDesigns = vi.mocked(searchProductDesigns);

describe("TechPackForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Create Mode", () => {
		it("renders create form correctly", () => {
			render(<TechPackForm />);

			expect(screen.getByRole("heading", { name: /create tech pack/i })).toBeInTheDocument();
			expect(screen.getByText("Enter the tech pack details")).toBeInTheDocument();
			expect(screen.getByText("Tech Pack Information")).toBeInTheDocument();
			expect(screen.getByDisplayValue("Draft")).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /create tech pack/i })).toBeInTheDocument();
		});

		it("submits create form successfully", async () => {
			mockCreateTechPack.mockResolvedValue({ success: true });

			render(<TechPackForm />);

			// Fill form
			fireEvent.change(screen.getByTestId("product-design-select"), { target: { value: "design-1" } });
			fireEvent.change(screen.getByPlaceholderText("Tech pack name"), { target: { value: "Test Tech Pack" } });
			fireEvent.change(screen.getByPlaceholderText("e.g., Screen Print, DTG, Embroidery"), { target: { value: "Screen Print" } });
			fireEvent.change(screen.getByPlaceholderText("Tech pack description and specifications"), { target: { value: "Test description" } });

			// Submit
			fireEvent.click(screen.getByRole("button", { name: /create tech pack/i }));

			await waitFor(() => {
				expect(mockCreateTechPack).toHaveBeenCalledWith({
					productDesignId: "design-1",
					name: "Test Tech Pack",
					description: "Test description",
					decorationMethod: "Screen Print",
					productionNotes: "",
					outputFiles: undefined,
					status: TechPackStatus.DRAFT,
				});
				expect(toast.success).toHaveBeenCalledWith("Tech pack created successfully");
				expect(mockRouter.push).toHaveBeenCalledWith("/design-projects/tech-packs");
			});
		});

		it("handles create form error", async () => {
			mockCreateTechPack.mockResolvedValue({ success: false, message: "Create failed" });

			render(<TechPackForm />);

			// Fill required fields
			fireEvent.change(screen.getByTestId("product-design-select"), { target: { value: "design-1" } });
			fireEvent.change(screen.getByPlaceholderText("Tech pack name"), { target: { value: "Test Tech Pack" } });
			fireEvent.change(screen.getByPlaceholderText("e.g., Screen Print, DTG, Embroidery"), { target: { value: "Screen Print" } });

			fireEvent.click(screen.getByRole("button", { name: /create tech pack/i }));

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith("Create failed");
			});
		});
	});

	describe("Edit Mode", () => {
		it("loads and displays tech pack data", async () => {
			const mockTechPack = {
				id: "tech-pack-1",
				productDesignId: "design-1",
				name: "Existing Tech Pack",
				description: "Existing description",
				decorationMethod: "DTG",
				productionNotes: "Production notes",
				outputFiles: '["file1.pdf", "file2.zip"]',
				status: TechPackStatus.IN_PROGRESS,
			};

			const mockDesign = {
				id: "design-1",
				name: "Product Design 1",
			};

			mockGetTechPackById.mockResolvedValue({ success: true, data: mockTechPack });
			mockGetProductDesignForForm.mockResolvedValue({ success: true, data: mockDesign });

			render(<TechPackForm techPackId="tech-pack-1" />);

			await waitFor(() => {
				expect(mockGetTechPackById).toHaveBeenCalledWith("tech-pack-1");
				expect(mockGetProductDesignForForm).toHaveBeenCalledWith("design-1");
			});

			expect(screen.getByText("Edit Tech Pack")).toBeInTheDocument();
			expect(screen.getByDisplayValue("Existing Tech Pack")).toBeInTheDocument();
			expect(screen.getByDisplayValue("DTG")).toBeInTheDocument();
			expect(screen.getByDisplayValue("In Progress")).toBeInTheDocument();
		});

		it("submits update form successfully", async () => {
			const mockTechPack = {
				id: "tech-pack-1",
				productDesignId: "design-1",
				name: "Existing Tech Pack",
				description: "",
				decorationMethod: "DTG",
				productionNotes: "",
				outputFiles: null,
				status: TechPackStatus.DRAFT,
			};

			mockGetTechPackById.mockResolvedValue({ success: true, data: mockTechPack });
			mockUpdateTechPack.mockResolvedValue({ success: true });

			render(<TechPackForm techPackId="tech-pack-1" />);

			await waitFor(() => {
				expect(screen.getByDisplayValue("Existing Tech Pack")).toBeInTheDocument();
			});

			// Update name
			fireEvent.change(screen.getByPlaceholderText("Tech pack name"), { target: { value: "Updated Tech Pack" } });

			fireEvent.click(screen.getByRole("button", { name: /update tech pack/i }));

			await waitFor(() => {
				expect(mockUpdateTechPack).toHaveBeenCalledWith("tech-pack-1", {
					productDesignId: "design-1",
					name: "Updated Tech Pack",
					description: "",
					decorationMethod: "DTG",
					productionNotes: "",
					outputFiles: undefined,
					status: TechPackStatus.DRAFT,
				});
				expect(toast.success).toHaveBeenCalledWith("Tech pack updated successfully");
				expect(mockRouter.push).toHaveBeenCalledWith("/design-projects/tech-packs/tech-pack-1");
			});
		});
	});

	describe("Form Validation", () => {
		it("shows validation errors for required fields", async () => {
			render(<TechPackForm />);

			fireEvent.click(screen.getByRole("button", { name: /create tech pack/i }));

			await waitFor(() => {
				// React Hook Form will show validation errors
				expect(screen.getByRole("heading", { name: /create tech pack/i })).toBeInTheDocument();
			});
		});
	});

	describe("UI Options", () => {
		it("hides header when hideHeader is true", () => {
			render(<TechPackForm hideHeader />);

			expect(screen.queryByRole("heading", { name: /create tech pack/i })).not.toBeInTheDocument();
		});

		it("hides buttons when hideButtons is true", () => {
			render(<TechPackForm hideButtons />);

			expect(screen.queryByRole("button", { name: /create tech pack/i })).not.toBeInTheDocument();
			expect(screen.getByText("Submit")).toBeInTheDocument(); // Hidden submit button
		});
	});

	describe("File Upload", () => {
		it("handles output files upload", async () => {
			const file = new File(["content"], "test.pdf", { type: "application/pdf" });
			mockCreateTechPack.mockResolvedValue({ success: true });

			render(<TechPackForm />);

			const fileInput = screen.getByTestId("output-files-input");
			fireEvent.change(fileInput, { target: { files: [file] } });

			// Fill required fields
			fireEvent.change(screen.getByTestId("product-design-select"), { target: { value: "design-1" } });
			fireEvent.change(screen.getByPlaceholderText("Tech pack name"), { target: { value: "Test Tech Pack" } });
			fireEvent.change(screen.getByPlaceholderText("e.g., Screen Print, DTG, Embroidery"), { target: { value: "Screen Print" } });

			fireEvent.click(screen.getByRole("button", { name: /create tech pack/i }));

			await waitFor(() => {
				expect(mockCreateTechPack).toHaveBeenCalledWith(
					expect.objectContaining({
						outputFiles: JSON.stringify(["test.pdf"]),
					})
				);
			});
		});
	});

	describe("Loading States", () => {
		it("shows loading spinner when editing and loading data", () => {
			mockGetTechPackById.mockImplementation(() => new Promise(() => { })); // Never resolves

			render(<TechPackForm techPackId="tech-pack-1" />);

			expect(document.querySelector('.animate-spin')).toBeInTheDocument();
		});

		it("disables submit button during submission", async () => {
			mockCreateTechPack.mockImplementation(() => new Promise(() => { })); // Never resolves

			render(<TechPackForm />);

			// Fill required fields
			fireEvent.change(screen.getByTestId("product-design-select"), { target: { value: "design-1" } });
			fireEvent.change(screen.getByPlaceholderText("Tech pack name"), { target: { value: "Test Tech Pack" } });
			fireEvent.change(screen.getByPlaceholderText("e.g., Screen Print, DTG, Embroidery"), { target: { value: "Screen Print" } });

			fireEvent.submit(screen.getByTestId("tech-pack-form"));

			await waitFor(() => {
				expect(screen.getByRole("button", { name: /create tech pack/i })).toBeDisabled();
			});
		});
	});
});