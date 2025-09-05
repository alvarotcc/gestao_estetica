# TODO - Application Review and Fixes

## ✅ Completed Tasks
- [x] Integrated notifications system with badge in MainLayout
- [x] Created useNotifications hook for centralized state management
- [x] Updated Notificacoes page to use shared hook
- [x] Added "Mark All as Read" functionality

## 🔧 Current Fixes Needed

### 1. Scrolling Issues in Dialog Forms
- [ ] Clientes.tsx: Add scrolling to client creation/editing dialog
- [ ] Servicos.tsx: Add scrolling to service creation/editing dialog
- [ ] Materiais.tsx: Add scrolling to material creation/editing dialog
- [ ] Colaboradores.tsx: Add scrolling to collaborator creation/editing dialog

### 2. Button Functionality Issues
- [ ] Fix "Eye" buttons across all pages (currently non-functional)
- [ ] Test notification badge functionality
- [ ] Verify all form submissions work correctly
- [ ] Test CRUD operations on all pages

### 3. UI/UX Improvements
- [ ] Improve dialog responsiveness on smaller screens
- [ ] Add loading states for async operations
- [ ] Improve error handling and user feedback
- [ ] Test all navigation links in sidebar

### 4. Testing Checklist
- [ ] Test all CRUD operations (Create, Read, Update, Delete)
- [ ] Test search functionality on all pages
- [ ] Test form validation and error messages
- [ ] Test notification system (badge, mark as read, mark all)
- [ ] Test responsive design on different screen sizes
- [ ] Test sidebar navigation and collapse functionality

## 📋 Implementation Plan

### Phase 1: Scrolling Fixes
1. Update Clientes.tsx dialog with proper scrolling
2. Update Servicos.tsx dialog with proper scrolling
3. Update Materiais.tsx dialog with proper scrolling
4. Update Colaboradores.tsx dialog with proper scrolling

### Phase 2: Button Functionality
1. Implement "View" functionality for Eye buttons
2. Test and fix any broken buttons
3. Add proper loading states

### Phase 3: UI/UX Polish
1. Improve responsive design
2. Add better error handling
3. Test all user flows

### Phase 4: Testing
1. Comprehensive testing of all features
2. Bug fixes based on testing results
3. Performance optimizations
