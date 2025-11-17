# 🚀 React + TypeScript + Vite

Before starting, make sure to install dependencies:

```bash
npm install
```

---

## 🎨 Styling with Tailwind CSS

The project is already configured with **Tailwind CSS**.
We recommend spending a little time learning its syntax to style the interface quickly and effectively.

* Documentation: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)

---

## 📡 Working with API via Axios

**Axios** is used for sending API requests.
The global configuration is set up and located in:

```
/src/lib/axiosInstance.ts
```

✅ Supports cookie-based authentication.

---

## ⚠️ Error Handling

Example of handling server errors can be found in **authSlice** (`/features/auth/authSlice.ts`).

---

## ✅ Redirect After Successful Requests

The registration form demonstrates how to perform a **redirect** after a successful action.

---

## 🗂️ Project Structure

### 📁 `/pages`

Contains **application pages**, corresponding to routes.

### 📁 `/components`

Holds **reusable UI components** and visual blocks that are not tied to a specific feature.

### 📁 `/features`

Each feature is a **logically isolated part of the application**:

```
features/
  auth/         # Authentication
  projects/     # Projects
  tasks/        # Tasks
```

Inside each feature:

| Folder      | Purpose                             |
| ----------- | ----------------------------------- |
| `slice.ts`  | Redux slice + business logic        |
| `services/` | API requests related to the feature |
| `types.ts`  | Local types for this feature        |

### 📁 `/types`

Global types used throughout the application (e.g., `User`, `Tokens`, `ApiError`, etc.)
