
### ITSC 3155 - Software Engineering Implementation

## Project Overview

Norms Gold Pan is a web application designed to connect college students with professors offering undergraduate research opportunities. Students can discover research opportunities, view information about projects, and interact with faculty.


## Implemented Feature

### Student Login

The implemented Sprint 1 feature is the Student Login page. This feature allows students to enter their username and password, receive an error message when credentials are incorrect, and access the student portal when valid credentials are provided.

The login interface was designed to follow the team's approved Figma prototype.

### User Story

**GitHub Issue #1: Student Login**

> As a user, I can login into the student portal.

**Acceptance Criteria:**

- The login interface must be easy to navigate.
- Users must be able to enter a username and password.
- Invalid credentials must produce an error message.
- Valid credentials must redirect the user to the student portal.

**Implementation Tasks:**

- Create the student login button.
- Create username and password input fields.
- Implement credential validation.
- Redirect users to the student portal after successful login.

[View GitHub Issue #1](https://github.com/npant1/3155implementation/issues/1)

## Figma Design

The student login interface was implemented using the team's original Figma prototype as a visual reference.

The design includes username and password fields, a Student Login button, and separate navigation options for professor login and account registration.

[View Student Login Figma Design](https://www.figma.com/proto/d0P8tCCwxmCInTN8C4LEjg/Main?node-id=1-2&t=4esNemZXWSrhdoKD-0&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A2)

## Technologies Used

- HTML5 for application structure
- CSS3 for styling and responsive layout
- JavaScript for login functionality and navigation
- Git and GitHub for version control
- Figma for UI/UX design

## Installation and Setup

### Prerequisites

- Git
- A modern web browser
- Python 3 (for running a local development server)

### Step 1: Clone the Repository

```bash
git clone https://github.com/npant1/3155implementation.git
```

### Step 2: Navigate to the Project

```bash
cd 3155implementation
```

### Step 3: Select the Student Login Branch

```bash
git checkout user-login
```

### Step 4: Run the Application

The Student Login implementation uses HTML, CSS, and JavaScript and does not require installing npm dependencies.

Start a local server:

```bash
python3 -m http.server 8000
```

On Windows, you can also use:

```bash
py -m http.server 8000
```

Open a browser and navigate to:

http://localhost:8000

## Feature Demonstration

### Student Login Process

1. Open the application in a browser.
2. Enter a username and password.
3. Click the **Student Login** button.
4. If the credentials are incorrect, an error message appears.
5. If the credentials are correct, the student is redirected to the student portal.
6. The student can log out to end the session.

### Demo Credentials

For testing purposes, the application uses the following credentials:

**Username:** `student`

**Password:** `student123`

These are demonstration credentials only and are not intended for production authentication.

## Testing

The Student Login feature can be tested against the original acceptance criteria.

| Acceptance Criteria | Test Procedure | Expected Result |
|---|---|---|
| Easy navigation | Open the login page and locate the navigation options | Student, Professor, and Sign Up options are accessible |
| Username and password entry | Enter text in both login fields | Both fields accept input |
| Invalid credentials | Enter an incorrect username or password and submit | An error message is displayed |
| Valid credentials | Enter `student` and `student123` | User is redirected to the student portal |
| Logout functionality | Log in and click Log out | The session ends and the login page is displayed |
| Protected student portal | Attempt to open `#/student-portal` without logging in | User is redirected to the login page |

These test cases describe the expected behavior implemented in the prototype. They can be demonstrated manually during the Sprint 1 presentation.

## Sprint Planning

GitHub Issues are used to track user stories, acceptance criteria, and implementation tasks.

**Sprint 1 Feature:** Student Login

**GitHub Issue:** [#1 - Student Login](https://github.com/npant1/3155implementation/issues/1)

The Student Login feature is implemented in the `user-login` branch.

## Version Control

GitHub is used to manage the project source code and track implementation changes.

**Repository:** [3155implementation](https://github.com/npant1/3155implementation)

**Feature Branch:** `user-login`

**Main Branch:** `main`

**Commit History:** [View Student Login Commits](https://github.com/npant1/3155implementation/commits/user-login/)

The feature branch contains the Student Login implementation and its initial development history.

The feature should be reviewed through a pull request before being merged into `main`.

## AI-Assisted Development

AI-assisted development tools can support the implementation process.

**GitHub Copilot**

GitHub Copilot can assist with generating code suggestions, improving JavaScript logic, identifying potential errors, and reviewing code.

**Figma MCP**

Figma MCP can provide design context from the Figma prototype to support implementation of interface elements, layouts, and styling.


## Current Limitations

The current Student Login implementation is a front-end prototype.

- Login credentials are predefined for demonstration purposes.
- No backend authentication service or user database is connected.
- Session state is stored in the browser using session storage.
- Professor login and account registration are separate navigation destinations but are not implemented in this feature branch.

Future development can include real authentication, database integration, and additional student and professor functionality.


## Project Deliverables

- Student Login implementation
- Original user story and acceptance criteria
- Figma design reference
- GitHub Sprint 1 issue
- Manual testing procedures
- Git commit history
- README documentation
- Pull request and merge into the main branch
