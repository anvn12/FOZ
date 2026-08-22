// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import toast from "react-hot-toast";
import { renderWithProviders } from "../../test/utils.js";
import { SearchPage } from "../SearchPage.js";
import * as searchApi from "../../api/search.js";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = (await vi.importActual("react-router-dom")) as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("react-hot-toast", () => {
  const toastMock = {
    error: vi.fn(),
    success: vi.fn(),
  };
  return {
    toast: toastMock,
    default: toastMock,
  };
});

vi.mock("../../api/search.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../api/search.js")>();
  return {
    ...actual,
    useSearch: vi.fn(),
    useSearchDiscovery: vi.fn(),
  };
});

describe("SearchPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const userItem = {
      id: "u-1",
      userAccountId: "acc-1",
      profileId: "p-1",
      username: "erostova",
      displayName: "Elena Rostova",
      bio: "Designer",
      avatarUrl: null,
      location: null,
      website: null,
      createdAt: new Date().toISOString(),
      type: "user",
    };
    const postItem = {
      id: "po-1",
      authorId: "acc-1",
      authorName: "Elena Rostova",
      authorUsername: "erostova",
      authorAvatarUrl: null,
      content: "React post content",
      body: "React post content",
      visibilityState: "public",
      lifecycleState: "active",
      createdAt: new Date().toISOString(),
      type: "post",
    };
    const hashtagItem = {
      id: "h-1",
      name: "designsystems",
      displayName: "DesignSystems",
      postCount: 3,
      type: "hashtag",
    };

    vi.mocked(searchApi.useSearch).mockImplementation((_query, type) => ({
      data: type === "users" ? [userItem] : [userItem, postItem, hashtagItem],
      isLoading: false,
    }) as any);

    vi.mocked(searchApi.useSearchDiscovery).mockReturnValue({
      data: {
        topics: [
          { id: "t1", name: "Design Systems", tag: "#DesignSystems" },
          { id: "t2", name: "AI Architecture", tag: "AI Architecture" },
        ],
        creators: [
          { id: "c1", userAccountId: "acc-1", displayName: "Elena Rostova", bio: "Designer", avatarUrl: null },
        ],
        discussions: [
          { id: "d1", authorId: "acc-1", authorName: "Elena Rostova", authorHandle: "@erostova", authorAvatarUrl: null, content: "Discussion topic 1", createdAt: new Date().toISOString(), likeCount: 5, commentCount: 2, repostCount: 0, attachments: [] },
        ],
      },
      isLoading: false,
    } as any);
  });

  it("does not render submit search arrow button when input is empty, renders when text is typed", () => {
    renderWithProviders(<SearchPage />);

    // Search input is empty initially
    expect(screen.queryByLabelText("Submit search")).toBeNull();

    // Type text into search input
    const input = screen.getByPlaceholderText("Search FOZ...");
    fireEvent.change(input, { target: { value: "react" } });

    // Submit search button should now be visible
    expect(screen.getByLabelText("Submit search")).toBeDefined();
  });

  it("renders dynamic search discovery widgets for topics, creators, and discussions", () => {
    renderWithProviders(<SearchPage />);

    expect(screen.getByText("#DesignSystems")).toBeDefined();
    expect(screen.getByText("AI Architecture")).toBeDefined();
    expect(screen.getAllByText("Elena Rostova").length).toBeGreaterThan(0);
    expect(screen.getByText("Discussion topic 1")).toBeDefined();
  });

  it("triggers profile search listing when clicking View all", () => {
    renderWithProviders(<SearchPage />);

    const viewAllButtons = screen.getAllByText("View all");
    expect(viewAllButtons.length).toBeGreaterThan(0);
    
    // Click header View all
    fireEvent.click(viewAllButtons[0]!);

    // Should switch to the Profile tab and list matching profiles
    expect(screen.getByRole("tab", { name: "Profile" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("Elena Rostova")).toBeDefined();
  });

  it("renders post and hashtag results after submitting a search", () => {
    renderWithProviders(<SearchPage />);

    const input = screen.getByPlaceholderText("Search FOZ...");
    fireEvent.change(input, { target: { value: "react" } });
    fireEvent.click(screen.getByLabelText("Submit search"));

    expect(screen.getByRole("tab", { name: "Posts" })).toBeDefined();
    expect(screen.getByText("React post content")).toBeDefined();
    expect(screen.getByText("Hashtags")).toBeDefined();
    expect(screen.getByText("#DesignSystems")).toBeDefined();

    // Switching to Profile shows people instead of posts
    fireEvent.click(screen.getByRole("tab", { name: "Profile" }));
    expect(screen.getByText("Elena Rostova")).toBeDefined();
    expect(screen.queryByText("React post content")).toBeNull();
  });

  it("does not trigger search when whitespace characters are entered and submitted", () => {
    renderWithProviders(<SearchPage />);

    const input = screen.getByPlaceholderText("Search FOZ...");
    // Type whitespace only
    fireEvent.change(input, { target: { value: "   " } });

    // Submit search button should NOT be rendered for whitespace only
    expect(screen.queryByLabelText("Submit search")).toBeNull();

    // Submit form via Enter key on the input
    fireEvent.submit(input.closest("form")!);

    // Search results UI ("People") should NOT be visible
    expect(screen.queryByText("People")).toBeNull();
  });

  it("shows toast error notification when search query exceeds 500 characters", () => {
    renderWithProviders(<SearchPage />);

    const input = screen.getByPlaceholderText("Search FOZ...");
    const longQuery = "a".repeat(501);
    fireEvent.change(input, { target: { value: longQuery } });

    const submitBtn = screen.getByLabelText("Submit search");
    expect(submitBtn).toBeDefined();

    fireEvent.click(submitBtn);

    expect(toast.error).toHaveBeenCalledWith(
      "Search query is too long. Please limit to 500 characters."
    );
    expect(screen.queryByRole("tab", { name: "Posts" })).toBeNull();
  });

  it("shows toast error notification when submitting form with search query longer than 500 characters", () => {
    renderWithProviders(<SearchPage />);

    const input = screen.getByPlaceholderText("Search FOZ...");
    const longQuery = "b".repeat(505);
    fireEvent.change(input, { target: { value: longQuery } });

    fireEvent.submit(input.closest("form")!);

    expect(toast.error).toHaveBeenCalledWith(
      "Search query is too long. Please limit to 500 characters."
    );
    expect(screen.queryByRole("tab", { name: "Posts" })).toBeNull();
  });
});
