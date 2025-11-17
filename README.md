# 🚀 React + TypeScript + Vite

Before starting, make sure to install dependencies:

```bash
npm install
```

---

## ⚡ Getting Started

To run the project locally:

```bash
# Start development server
npm run dev

# Build production version
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file in the root of the project to configure API endpoints and other variables:

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_FRONTEND_BASE_URL=http://localhost:5173
```

> Make sure to restart the dev server after changing `.env` variables.

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

---

## 🤝 Contributing

Contributions are welcome! You can help by:

1. Forking the repository.
2. Creating a new branch:

```bash
git checkout -b feature/your-feature-name
```

3. Making your changes and committing them:

```bash
git commit -m "Add new feature"
```

4. Pushing the branch to your fork and opening a Pull Request.

Please make sure your code follows existing style conventions and is well-tested.

---

## 🔗 Useful Links

* **React**: [https://reactjs.org/](https://reactjs.org/)
* **TypeScript**: [https://www.typescriptlang.org/](https://www.typescriptlang.org/)
* **Vite**: [https://vitejs.dev/](https://vitejs.dev/)
* **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
* **Axios**: [https://axios-http.com/](https://axios-http.com/)
