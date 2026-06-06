# SERVITUR — Contexto del proyecto

App de gestión de transporte: viajes/facturas, clientes, pagos. React + TypeScript + Vite + Supabase + Zustand + Tailwind.

## Stack actual

- React 18 + TypeScript (strict)
- Vite + Tailwind CSS
- React Router v6
- Zustand v5 (server + client state mezclado)
- Supabase (backend)
- lucide-react, recharts, jspdf

## Tooling

- ESLint v9 (flat config) + typescript-eslint + react-hooks + Prettier integration
- Prettier (semi: false, singleQuote, trailingComma all, printWidth 100)
- Husky v9 + lint-staged (pre-commit: eslint --fix + prettier --write)
- Path alias `@/` → `src/` (tsconfig + vite.config.ts)
- EditorConfig

## Estado actual de refactorización (2026-06-02)

El proyecto viene de una refactorización parcial que extrajo componentes y hooks, y añadió `fetchAll()` en varias páginas. Queda pendiente una alineación con patrones bulletproof-react.

### Cambios ya aplicados

- Theme extraído a `lib/theme.tsx`
- Componentes extraídos: AdminSidebar, AdminTopBar, GlobalThemeToggle, MobileNav, PublicSidebar, ProtectedRoute, InvoiceFormModal, PaymentModal, EditPaymentModal, ViewAttachmentModal, SelectionBar, StatsCards, PendingInvoicesTable, PaidInvoicesTable, InvoicePreviewModal
- Hooks extraídos: useDeleteConfirm, usePayments, useSort, useInvoicePreview, useFileUpload
- PDF movido a lib/pdfService.ts / pdfUtils.ts
- Invoices.tsx eliminado (huérfano, su funcionalidad vive en ClientDetail)
- Trips.tsx quedó solo como visualización (sin add/edit, solo delete)
- Dashboard cards de Clientes y Facturación eliminados
- `useEffect(() => { fetchAll() }, [])` en Dashboard, Trips, ClientsAdmin, ClientDetail
- **Tooling**: ESLint v9 flat config, Prettier, Husky v9 + lint-staged, EditorConfig, `.vscode/` settings
- **Alias @/**: configurado en vite.config.ts (resolve.alias)

## Plan de refactorización bulletproof-react priorizado

### 🔴 Críticos

1. ~~**Server data a TanStack Query**~~ ✅ Hecho
   - Reemplazar Zustand useStore para datos de servidor (clients, invoices, payments) por TanStack Query
   - Crear `features/<entity>/api/` con patrón de 3 capas: schema zod → fetcher → queryOptions → hook
   - Zustand queda solo para estado cliente (notificaciones, tema)

2. **Agregar zod para validación + react-hook-form**
   - Schemas ya creados en cada API file, tipos inferidos con `z.infer`
   - Pendiente: migrar forms inline (InvoiceFormModal, ClientsAdmin) a react-hook-form + zodResolver

3. **Error boundaries + manejo de errores**
   - ErrorBoundary global en App
   - ErrorElement por ruta
   - Sistema de notificaciones toast (Zustand store ya listo)
   - Reemplazar `alert()`, `console.log()`, `console.error()`

4. **Dejar de silenciar errores de Supabase**
   - ✅ Ya completado — ahora todas las operaciones lanzan `throw error` en lugar de `if (!error)`

### 🟡 Medios

5. ~~**Alias @/ funcional**~~ ✅ Hecho
   - Configurar `resolve.alias` en `vite.config.ts`
   - Migrar todos los imports a `@/`

6. **Estructura features/**
   - Mover pages/ a `features/<domain>/components/`
   - Separar `app/routes/`, `app/provider.tsx`, `app/router.tsx`
   - Agregar barrel exports (`index.ts`)

7. **kebab-case en archivos**
   - Renombrar todos los .ts/.tsx a kebab-case

8. **Componentes con cva + forwardRef + displayName**
   - Botón, Modal, Input, Select reutilizables

9. **Lazy loading por ruta**

### 🟢 Bajos

10. Agregar tests (Vitest + Testing Library + MSW)
11. Import ordering consistente
12. Sistema de notificaciones toast

## Decisiones de diseño

- Trips.tsx es read-only (solo visualización + delete)
- Add/edit de facturas solo desde ClientDetail
- No hay ruta `/admin/facturas` independiente (las facturas se ven en Trips y se gestionan por cliente)
- Tema claro/oscuro via CSS custom properties (migrado desde React Context en refactor/tailwind-theme)
- EmailJS instalado pero sin usar (Contact usa setTimeout)

## Flujo de desarrollo (bulletproof)

### Commits atómicos

Cada commit debe representar **un solo cambio lógico**. No mezclar refactor, feat y fix en el mismo commit.

```
❌ Mal:    "refactor: migrate theme and fix contrast and add focus ring"
✅ Bien:   "refactor: migrate useTheme() to CSS variables in landing components"
           "feat: add focus-visible ring with glow effect"
           "fix: replace hardcoded bg-white with bg-background in logos"
```

Esto permite `git bisect`, revertir cambios específicos, y revisión por partes.

### Pasos

1. **Crear rama**: `git checkout -b <tipo>/<feature-name>` desde main
   Tipos: `fix` (bug) | `feat` (feature) | `refactor` (refactorización) | `chore` (tooling)
2. **Desarrollar**: Hacer cambios siguiendo patrones bulletproof (features/, 3-capas, etc.)
3. **Commits atómicos durante el desarrollo**:
   - `git add <archivos específicos>` (evitar `git add -A` a menos que sea un único cambio)
   - `git commit -m "<tipo>: descripción concisa"`
   - Hook `commit-msg` valida el formato automáticamente
4. **Revisar diff completo**: `git diff main...HEAD` para ver todos los cambios de la rama
5. **Typecheck + build**: `pnpm build` (corre tsc + vite build)
6. **Previsualizar**: `pnpm build && pnpm preview` — sirve prod local en `http://localhost:4173/servitur-app/`
7. **Verificar en navegador**: probar modo claro/oscuro, rutas, funcionalidad
8. **Revisión del usuario**: muestras los cambios para que revise y modifique si es necesario
9. **Push + Pull Request** (incluso en trabajo individual):
   ```bash
   git push origin <tipo>/<feature-name>
   gh pr create --title "<tipo>: descripción" --body "Resumen de cambios"
   ```
   - Esto permite ver el diff completo en GitHub UI + CI checks antes de integrar
10. **Merge a main**: Squash merge desde GitHub (1 commit limpio en `main`) o:
    ```bash
    git checkout main && git merge --squash <tipo>/<feature-name> && git commit -m "<tipo>: descripción"
    git push origin main
    ```
11. **Limpiar**: `git branch -d <tipo>/<feature-name>` (local) y `git push origin --delete <tipo>/<feature-name>` (remoto)
