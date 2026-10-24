# IntellectA — Comprehensive Selenium E2E Automation Testing Guide

This guide establishes the official End-to-End (E2E) Browser Automation testing framework for **IntellectA** using **Selenium WebDriver (Python)**.

---

## 🏛️ System UI Architecture & Team Allocation

The frontend user journey is partitioned into **6 UI Modules**, evenly divided between **Member 1** and **Member 2** (3 UI modules each).

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            IntellectA Frontend UI                                │
│                          (Next.js 14 Web Application)                            │
└────────────────────────┬─────────────────────────────────┬───────────────────────┘
                         │                                 │
            ┌────────────┴────────────┐       ┌────────────┴────────────┐
            │   Member 1: Marketing,  │       │ Member 2: Pedagogical,  │
            │     Auth & Core Chat    │       │ Multimodal & Workspaces │
            └────────────┬────────────┘       └────────────┬────────────┘
                         │                                 │
           ┌─────────────┼─────────────┐     ┌─────────────┼─────────────┐
           ▼             ▼             ▼     ▼             ▼             ▼
       [UI Mod 1]    [UI Mod 2]    [UI Mod 3]  [UI Mod 4]    [UI Mod 5]    [UI Mod 6]
        Landing        Auth &        Core Chat     Adaptive       Image        Session
        Page &         Account       Workspace       Quiz       Attachment   Management
       Discovery      Lifecycle      & Agents     Interaction   & Diagram    & Themes
```

### Member UI Assignment Breakdown

| Assigned To | UI Module # | Interface Domain | URL / Viewport | Core Elements & User Journeys |
| :--- | :--- | :--- | :--- | :--- |
| **Member 1** | **UI Module 1** | Landing Page & Exploration | `http://localhost:3000/` | Hero search, subject chips, feature cards, FAQ accordion, header CTA |
| **Member 1** | **UI Module 2** | Auth & Account Lifecycle | `http://localhost:3000/login` | Mode toggle (Sign In vs Register), inputs, validation error alerts, session redirect |
| **Member 1** | **UI Module 3** | Core Chat & Agent Routing | `http://localhost:3000/chat` | Prompt chips, textarea, send button, streaming dots, agent specialist badges |
| **Member 2** | **UI Module 4** | Interactive Adaptive Quiz | `http://localhost:3000/chat` | Quiz prompt submission, evaluator card, answer input, score & difficulty adjustment |
| **Member 2** | **UI Module 5** | Image Upload & Multimodal | `http://localhost:3000/chat` | File picker, preview thumbnail, cancel attachment, diagram query submission |
| **Member 2** | **UI Module 6** | Session Sidebar & Theme | `http://localhost:3000/chat` | "+ New Chat", session list, title rename, delete modal, dark/light theme toggle |

---

## 🛠️ Global Selenium Setup & Prerequisites

### 1. Python Environment Installation

Inside your test environment:

```powershell
pip install selenium webdriver-manager pytest pytest-html
```

### 2. Base Test Driver Configuration: `e2e_tests/conftest.py`

Create a standardized Selenium fixture with explicit waits, headless options, and automated failure screenshots:

```python
import os
import pytest
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = "http://localhost:3000"

@pytest.fixture(scope="function")
def driver(request):
    chrome_options = Options()
    # Uncomment to run headless in CI/CD:
    # chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.implicitly_wait(5)

    yield driver

    # Take screenshot on test failure
    if hasattr(request.node, "rep_call") and request.node.rep_call.failed:
        os.makedirs("e2e_tests/screenshots", exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        test_name = request.node.name
        driver.save_screenshot(f"e2e_tests/screenshots/FAIL_{test_name}_{timestamp}.png")

    driver.quit()

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    setattr(item, "rep_" + rep.when, rep)
```

---

# 👤 MEMBER 1: MARKETING, AUTH & CORE CHAT WORKSPACE

---

## 🖥️ UI Module 1: Landing Page & Marketing Exploration Flow

### 1. Interface Overview
- **Route**: `http://localhost:3000/`
- **Component**: [`frontend/app/page.tsx`](file:///d:/Downloads/IntellectA-main/IntellectA-main/frontend/app/page.tsx) and [`frontend/components/dockit/`](file:///d:/Downloads/IntellectA-main/IntellectA-main/frontend/components/dockit/)
- **Visual Design**: Dark Dockit-style landing page with hero banner, 8 subject chips, feature grid, interactive tabs, testimonials marquee, and FAQ accordion.

### 2. Exact DOM Selectors

| Element Description | Selector Type | Selector Value | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **Header Wordmark** | CSS | `header a[href="/"]` | Present and links to home |
| **Get Started Button (Nav)** | CSS | `header a[href="/login"]` | Navigates to `/login` |
| **Hero Title** | CSS | `.dockit-hero h1` | Contains "study companion" |
| **Hero Subject Chips** | CSS | `.hero-subject-chip` | Clicking seeds prompt into search input |
| **Hero Search Input** | CSS | `.hero-search-input` | Accepts typed user questions |
| **Hero Submit Button** | CSS | `.hero-search-btn` | Submits prompt to `/login` or `/chat` |
| **Interactive Tabs (How it Works)** | CSS | `.how-it-works-tab` | Switches active tab preview card |
| **FAQ Accordion Item** | CSS | `.faq-item button` | Expands answer container on click |

### 3. Complete Test Script: `e2e_tests/test_member1_landing.py`

```python
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:3000"

def test_landing_page_title_and_hero(driver):
    driver.get(BASE_URL)
    wait = WebDriverWait(driver, 10)

    # 1. Assert page title
    assert "IntellectA" in driver.title

    # 2. Assert hero section visible
    hero_title = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "h1")))
    assert "study companion" in hero_title.text.lower() or "eight subject experts" in hero_title.text.lower()


def test_subject_chips_seed_prompt(driver):
    driver.get(BASE_URL)
    wait = WebDriverWait(driver, 10)

    # Click first subject chip (e.g., Mathematics or Physics)
    chips = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".hero-subject-chip, .dockit-chip")))
    assert len(chips) > 0, "Expected subject chips in hero section"
    
    first_chip_text = chips[0].text
    chips[0].click()

    # Verify input receives text
    search_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Ask']")
    assert len(search_input.get_attribute("value")) > 0


def test_header_get_started_navigates_to_login(driver):
    driver.get(BASE_URL)
    wait = WebDriverWait(driver, 10)

    get_started_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//header//a[contains(text(), 'Get started')]"))
    )
    get_started_btn.click()

    wait.until(EC.url_contains("/login"))
    assert "/login" in driver.current_url
```

---

## 🖥️ UI Module 2: Authentication & Account Lifecycle Flow

### 1. Interface Overview
- **Route**: `http://localhost:3000/login`
- **Component**: [`frontend/app/login/page.tsx`](file:///d:/Downloads/IntellectA-main/IntellectA-main/frontend/app/login/page.tsx)
- **Visual Design**: Two-column auth screen. Left: Marketing perks & subject tiles. Right: Glassmorphism auth card with tabs (`Sign in` / `Register`), form fields, and error alert banners.

### 2. Exact DOM Selectors

| Element Description | Selector Type | Selector Value | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **Sign In Tab** | XPath | `//button[contains(@class, 'dockit-auth-tab') and text()='Sign in']` | Displays login form |
| **Register Tab** | XPath | `//button[contains(@class, 'dockit-auth-tab') and text()='Register']` | Displays registration form with Name |
| **Full Name Input** | ID | `#name` | Visible only on Register tab |
| **Email Input** | ID | `#email` | Accepts email string |
| **Password Input** | ID | `#password` | Masked password field (min 6 chars) |
| **Submit Button** | CSS | `button[type="submit"].btn-primary` | Triggers form submission |
| **Error Alert Banner** | CSS | `.dockit-auth-error` | Displays API rejection reason in red |

### 3. Complete Test Script: `e2e_tests/test_member1_auth.py`

```python
import uuid
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:3000/login"

def test_auth_tab_switching(driver):
    driver.get(BASE_URL)
    wait = WebDriverWait(driver, 10)

    # Initial state should be login (name input absent)
    name_inputs = driver.find_elements(By.ID, "name")
    assert len(name_inputs) == 0

    # Switch to Register tab
    register_tab = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Register')]")))
    register_tab.click()

    # Name input must now be visible
    name_input = wait.until(EC.visibility_of_element_located((By.ID, "name")))
    assert name_input.is_displayed()


def test_login_invalid_credentials_shows_error(driver):
    driver.get(BASE_URL)
    wait = WebDriverWait(driver, 10)

    email_input = wait.until(EC.visibility_of_element_located((By.ID, "email")))
    password_input = driver.find_element(By.ID, "password")
    submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

    email_input.send_keys("unregistered_user@example.com")
    password_input.send_keys("WrongPassword123")
    submit_btn.click()

    # Error alert must appear
    error_box = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".dockit-auth-error")))
    assert "invalid" in error_box.text.lower() or "not found" in error_box.text.lower() or "error" in error_box.text.lower()


def test_user_registration_and_redirect_to_chat(driver):
    driver.get(BASE_URL)
    wait = WebDriverWait(driver, 10)

    # 1. Switch to Register
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Register')]"))).click()

    # 2. Fill form with random unique email
    unique_email = f"student_{uuid.uuid4().hex[:8]}@university.edu"
    wait.until(EC.visibility_of_element_located((By.ID, "name"))).send_keys("Automation Student")
    driver.find_element(By.ID, "email").send_keys(unique_email)
    driver.find_element(By.ID, "password").send_keys("SecurePass2026!")

    # 3. Submit
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    # 4. Verify redirected to /chat
    wait.until(EC.url_contains("/chat"))
    assert "/chat" in driver.current_url
```

---

## 🖥️ UI Module 3: Core Chat Workspace & Agent Routing Flow

### 1. Interface Overview
- **Route**: `http://localhost:3000/chat`
- **Component**: [`frontend/components/chat-interface.tsx`](file:///d:/Downloads/IntellectA-main/IntellectA-main/frontend/components/chat-interface.tsx)
- **Visual Design**: Chat feed, suggested prompt chips for empty chats, auto-expanding textarea, send button, streaming loading indicator, and agent specialist badge (`Physics`, `Mathematics`, `Chemistry`, etc.).

### 2. Exact DOM Selectors

| Element Description | Selector Type | Selector Value | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **Suggested Prompt Chip** | CSS | `.dockit-suggested-prompt` | Fills textarea and submits question |
| **Message Textarea** | CSS | `textarea.dockit-chat-textarea` | Accepts multiline questions |
| **Send Message Button** | CSS | `button.btn-primary.btn-icon` | Triggers chat dispatch |
| **Loading Dots Indicator** | CSS | `.dockit-loading-dot` | Pulses during inference |
| **Assistant Message Card** | CSS | `.dockit-message-assistant` | Contains formatted response |
| **Subject Agent Badge** | CSS | `.dockit-agent-badge` | Displays active specialist slug |
| **Copy Answer Button** | CSS | `button[title*='Copy']` | Copies markdown answer to clipboard |

### 3. Complete Test Script: `e2e_tests/test_member1_chat.py`

```python
import uuid
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:3000"

def login_helper(driver):
    """Registers a fresh test user and enters the chat workspace."""
    driver.get(f"{BASE_URL}/login")
    wait = WebDriverWait(driver, 10)
    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Register')]"))).click()
    
    unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
    wait.until(EC.visibility_of_element_located((By.ID, "name"))).send_keys("Test Runner")
    driver.find_element(By.ID, "email").send_keys(unique_email)
    driver.find_element(By.ID, "password").send_keys("Password123!")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    wait.until(EC.url_contains("/chat"))

def test_send_physics_question_and_verify_agent_badge(driver):
    login_helper(driver)
    wait = WebDriverWait(driver, 20)

    # 1. Locate textarea and type academic query
    textarea = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "textarea.dockit-chat-textarea")))
    textarea.send_keys("What is Newton's third law of motion?")
    textarea.send_keys(Keys.ENTER)

    # 2. Verify loading indicator appears
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".dockit-loading-dot")))

    # 3. Wait for assistant response to render
    assistant_msg = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, ".dockit-message-assistant, [data-agent]"))
    )
    assert len(assistant_msg.text) > 30

    # 4. Verify Physics Specialist Badge was assigned
    badge = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".dockit-agent-badge, [class*='badge']")))
    assert "physics" in badge.text.lower()
```

---

# 👤 MEMBER 2: PEDAGOGICAL, MULTIMODAL & WORKSPACE UTILITIES

---

## 🖥️ UI Module 4: Interactive Adaptive Quiz Flow

### 1. Interface Overview
- **Route**: `http://localhost:3000/chat`
- **Component**: [`frontend/components/chat-interface.tsx`](file:///d:/Downloads/IntellectA-main/IntellectA-main/frontend/components/chat-interface.tsx) & Evaluator Agent
- **Visual Design**: Chat cards rendering specialized evaluation formatting, score rating, feedback explanation, and adaptive difficulty levels.

### 2. Exact DOM Selectors

| Element Description | Selector Type | Selector Value | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **Chat Input Textarea** | CSS | `textarea.dockit-chat-textarea` | Send `"quiz me on [topic]"` |
| **Evaluator Badge** | CSS | `.dockit-agent-badge` | Displays `evaluator` or `quiz` badge |
| **Quiz Question Content** | CSS | `.dockit-message-assistant p` | Contains question text & prompt |
| **Answer Response Box** | CSS | `textarea.dockit-chat-textarea` | Submits student answer |
| **Feedback & Score Card** | CSS | `.dockit-message-assistant` | Contains feedback and next question |

### 3. Complete Test Script: `e2e_tests/test_member2_quiz.py`

```python
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from test_member1_chat import login_helper

def test_quiz_initiation_and_answer_submission(driver):
    login_helper(driver)
    wait = WebDriverWait(driver, 25)

    # 1. Ask for a quiz
    textarea = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "textarea.dockit-chat-textarea")))
    textarea.send_keys("quiz me on photosynthesis")
    textarea.send_keys(Keys.ENTER)

    # 2. Wait for question response
    assistant_msgs = wait.until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".dockit-message-assistant"))
    )
    question_text = assistant_msgs[-1].text
    assert any(term in question_text.lower() for term in ["chloroplast", "light", "glucose", "atp", "question", "1"])

    # 3. Submit an answer to the quiz question
    textarea = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "textarea.dockit-chat-textarea")))
    textarea.send_keys("It occurs in the chloroplasts using chlorophyll to absorb sunlight.")
    textarea.send_keys(Keys.ENTER)

    # 4. Wait for evaluation & next question
    WebDriverWait(driver, 25).until(lambda d: len(d.find_elements(By.CSS_SELECTOR, ".dockit-message-assistant")) >= 2)
    latest_msg = driver.find_elements(By.CSS_SELECTOR, ".dockit-message-assistant")[-1].text

    # Verify assessment feedback exists
    assert any(w in latest_msg.lower() for w in ["correct", "score", "good", "well done", "next", "feedback"])
```

---

## 🖥️ UI Module 5: Image Attachment & Multimodal Doubt Solving Flow

### 1. Interface Overview
- **Route**: `http://localhost:3000/chat`
- **Component**: [`frontend/components/chat-interface.tsx`](file:///d:/Downloads/IntellectA-main/IntellectA-main/frontend/components/chat-interface.tsx)
- **Visual Design**: Image attachment trigger button (`ImagePlus` icon), hidden `<input type="file">`, image thumbnail preview with file size badge, remove attachment button (`X` icon), and error banners for oversized files.

### 2. Exact DOM Selectors

| Element Description | Selector Type | Selector Value | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **Image Trigger Button** | CSS | `button[title="Upload image"]` | Triggers file picker click |
| **Hidden File Input** | CSS | `input[type="file"][accept*="image"]` | Receives file path via `send_keys` |
| **Image Preview Card** | CSS | `img[alt="Preview"]` | Shows 80x80px uploaded thumbnail |
| **Remove Image Button** | CSS | `button:has(svg.lucide-x)` | Clears pending image preview |
| **Image Error Alert** | CSS | `p.text-red-500` | Displays error if file exceeds 4 MB |

### 3. Complete Test Script: `e2e_tests/test_member2_multimodal.py`

```python
import os
import tempfile
from PIL import Image
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from test_member1_chat import login_helper

def create_dummy_image(size_mb=0.1):
    """Creates a temporary JPEG image for testing."""
    tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
    img = Image.new("RGB", (200, 200), color=(73, 109, 137))
    img.save(tmp.name)
    return tmp.name

def test_image_attachment_preview_and_removal(driver):
    login_helper(driver)
    wait = WebDriverWait(driver, 10)

    # 1. Attach image via hidden input
    image_path = create_dummy_image()
    file_input = driver.find_element(By.CSS_SELECTOR, "input[type='file']")
    file_input.send_keys(image_path)

    # 2. Verify thumbnail preview appears
    preview_img = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "img[alt='Preview']")))
    assert preview_img.is_displayed()

    # 3. Remove image using the close button
    remove_btn = driver.find_element(By.CSS_SELECTOR, "button:has(svg.lucide-x)")
    remove_btn.click()

    # 4. Verify preview disappeared
    WebDriverWait(driver, 5).until(EC.invisibility_of_element_located((By.CSS_SELECTOR, "img[alt='Preview']")))
    os.remove(image_path)


def test_send_doubt_with_attached_image(driver):
    login_helper(driver)
    wait = WebDriverWait(driver, 25)

    # 1. Attach image
    image_path = create_dummy_image()
    file_input = driver.find_element(By.CSS_SELECTOR, "input[type='file']")
    file_input.send_keys(image_path)

    # 2. Add question and send
    textarea = driver.find_element(By.CSS_SELECTOR, "textarea.dockit-chat-textarea")
    textarea.send_keys("Solve this diagram equation step by step.")
    textarea.send_keys(Keys.ENTER)

    # 3. Verify assistant responds
    assistant_msg = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".dockit-message-assistant")))
    assert len(assistant_msg.text) > 10
    os.remove(image_path)
```

---

## 🖥️ UI Module 6: Session Management & Theme Workspace Utilities Flow

### 1. Interface Overview
- **Route**: `http://localhost:3000/chat`
- **Component**: [`frontend/components/chat-sidebar.tsx`](file:///d:/Downloads/IntellectA-main/IntellectA-main/frontend/components/chat-sidebar.tsx)
- **Visual Design**: Resizable left sidebar, "+ New Chat" button, search input for session filtering, session title cards, options dropdown (`...`), rename title input, delete session button, and light/dark theme toggle.

### 2. Exact DOM Selectors

| Element Description | Selector Type | Selector Value | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **New Chat Button** | XPath | `//button[contains(., 'New chat')]` | Clears active chat to blank state |
| **Search Sessions Input** | CSS | `input[placeholder*='Search']` | Filters list of past chats |
| **Chat Session Item** | CSS | `.dockit-session-item, [role='button']` | Switches current conversation |
| **Session Options Menu** | CSS | `button:has(svg.lucide-more-horizontal)` | Opens dropdown (Rename / Delete) |
| **Delete Session Option** | XPath | `//div[@role='menuitem' and contains(., 'Delete')]` | Removes chat from list and DB |
| **Theme Toggle Button** | CSS | `button[aria-label*='theme'], button:has(svg.lucide-sun), button:has(svg.lucide-moon)` | Toggles `dark` class on `<html>` |

### 3. Complete Test Script: `e2e_tests/test_member2_sessions.py`

```python
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from test_member1_chat import login_helper

def test_create_multiple_sessions_and_switch(driver):
    login_helper(driver)
    wait = WebDriverWait(driver, 20)

    # 1. Ask a question to create Session 1
    textarea = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "textarea.dockit-chat-textarea")))
    textarea.send_keys("What is the speed of light?")
    textarea.send_keys(Keys.ENTER)
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".dockit-message-assistant")))

    # 2. Click "+ New chat"
    new_chat_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'New chat')]"))
    )
    new_chat_btn.click()

    # 3. Verify textarea is now blank
    textarea = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "textarea.dockit-chat-textarea")))
    assert textarea.get_attribute("value") == ""

    # 4. Ask a second question for Session 2
    textarea.send_keys("Define GDP in economics.")
    textarea.send_keys(Keys.ENTER)
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".dockit-message-assistant")))

    # 5. Verify at least two session items appear in the sidebar
    session_items = wait.until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "[class*='session'], [class*='chat-item']"))
    )
    assert len(session_items) >= 2


def test_theme_toggle_switches_dark_light_mode(driver):
    login_helper(driver)
    wait = WebDriverWait(driver, 10)

    html_tag = driver.find_element(By.TAG_NAME, "html")
    initial_class = html_tag.get_attribute("class") or ""

    # Locate theme toggle button
    theme_btn = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button:has(svg.lucide-sun), button:has(svg.lucide-moon)"))
    )
    theme_btn.click()

    # Verify class changed (e.g. dark added or removed)
    WebDriverWait(driver, 5).until(lambda d: d.find_element(By.TAG_NAME, "html").get_attribute("class") != initial_class)
    updated_class = driver.find_element(By.TAG_NAME, "html").get_attribute("class")
    assert updated_class != initial_class
```

---

## 🚀 Execution & Automation Reporting

### Step 1: Ensure Local Services Are Running
Prior to running Selenium tests, ensure both frontend and backend are active:
- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:8000`

### Step 2: Running Member 1 Test Suite
```powershell
pytest e2e_tests/test_member1_landing.py -v --html=reports/member1_landing_report.html
pytest e2e_tests/test_member1_auth.py -v --html=reports/member1_auth_report.html
pytest e2e_tests/test_member1_chat.py -v --html=reports/member1_chat_report.html
```

### Step 3: Running Member 2 Test Suite
```powershell
pytest e2e_tests/test_member2_quiz.py -v --html=reports/member2_quiz_report.html
pytest e2e_tests/test_member2_multimodal.py -v --html=reports/member2_multimodal_report.html
pytest e2e_tests/test_member2_sessions.py -v --html=reports/member2_sessions_report.html
```

### Step 4: Running Full Team Suite with Automated HTML Report
```powershell
pytest e2e_tests/ -v --html=reports/full_e2e_report.html --self-contained-html
```
