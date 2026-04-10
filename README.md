# JSL Portfolio Piece: Kanban App Deployment & Features Implementation

## Overview

This project involves **deploying a Kanban app to Netlify**, ensuring the app's functionality and persistence through local storage, and implementing dynamic features such as task editing, deletion, sidebar interaction, and a theme toggle. The goal is to deliver a fully functional, deployable application that is responsive across devices and maintains data consistency. Students will also focus on **clean, modular code** that is well-documented for future development.

## WHAT to Submit

- **JSLPP GitHub Repo**: Your JSLPP GitHub repository PREMAS25564_PTO2508_Group-B_Precious_Mashingaidze_JSLPP

- **Recorded Presentation:** A **5-10 minutes** -https://app.airtimetools.com/recorder/s/z_LVcm3POuPDN5wMBOEVem

## HOW to Submit Your Project

- Deployment Link: https://premas25564-my-kanban-app.netlify.app/

## Before You Begin

**Check out the [Figma Reference File](https://www.figma.com/design/y7bFCUYL5ZHfPeojACBXg2/Challenges-%7C-JSL?node-id=6033-11092&t=XbQhBWPYxXDAqp3x-1) and the project user stories in your student dashboard** before you start building.

## Key Objectives

### Deployment & Hosting

    **Fetch tasks from the API on first load**
    **Save all changes to the browser's localStorage**
    **Work on any device with a modern browser**
    **Support both light and dark themes**

### Initial Data Fetching & Loading State

- **Fetch tasks dynamically** from an API: https://jsl-kanban-api.vercel.app/

- **| **API Fetching\*\* | Refresh page, show tasks loading | `scripts.js` - `fetchTasks()` function
-

### Data Persistence

- **| **Local Storage\*\* | Refresh page, show data persists | `scripts.js` - `saveTasks()` and `loadTasks()` functions
-

### Task Editing & Deletion

| **Add Task** | Click "Add New Task", fill form with priority | `scripts.js` - `addTask()` function
| **Edit Task** | Click a task card, modify fields, save | `scripts.js` - `updateTask()` function
| **Delete Task** | Click delete, confirm deletion | `scripts.js` - `deleteTask()` function

### Sidebar Interaction

| **Sidebar Toggle** | Hide/show sidebar on desktop | `scripts.js` - `toggleSidebar()` function

### Mobile Sidebar (Menu) Functionality

| **Mobile Menu** | Resize browser, show mobile dropdown | `styles.css` - media queries

### Theme Toggle (Dark/Light Mode)

| **Theme Toggle** | Switch between light and dark mode | `scripts.js` - `toggleTheme()` function

### Stretch Goal: Adding Priority (Optional)

| **Priority Sorting** | Show high priority tasks at top | `scripts.js` - `getTasksByStatus()` with sorting
| **Priority Indicator** | Point out colored dots on cards | `styles.css` - `.priority-high/medium/low`

## Code Quality & Maintainability

- **Break the code into separate modules** with clear responsibilities (e.g., local storage handling, task rendering, modal management) to improve maintainability and scalability.
- Use **descriptive, meaningful variable and function names** to make the code easy to understand.
- **Document every major function and module** using **JSDoc comments** to explain the purpose, parameters, and return values of each part of the code.

## Expected Outcome

A fully functional Kanban app that:

- Dynamically fetches and displays tasks.
- Supports task editing, deletion, and persistent storage through local storage.
- Has a responsive, mobile-friendly sidebar with a theme toggle switch.
- App deployed to **Netlify** with a custom, readable URL.
- Uses modular, well-documented code that is easy to maintain and scale.
