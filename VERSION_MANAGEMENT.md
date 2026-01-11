# Version Management System

## Overview
Sistem version management untuk tracking versi aplikasi dan deployment changes.

## Features
- **Version Display**: Menampilkan version dari package.json di dashboard
- **Build Timestamp**: Menampilkan kapan aplikasi di-build
- **Auto-injection**: Version dan build time otomatis di-inject saat build

## Implementation

### 1. Version Utility (`src/utils/version.ts`)
```typescript
export const getAppVersion = () => {
  const version = import.meta.env.VITE_APP_VERSION || '1.0.0';
  const buildTime = import.meta.env.VITE_BUILD_TIME || new Date().toISOString();
  
  return {
    version,
    buildTime: new Date(buildTime),
    buildId: buildTime.slice(-8)
  };
};
```

### 2. Vite Configuration
Version dan build time di-inject melalui `vite.config.ts`:
```typescript
define: {
  'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version || '1.0.0'),
  'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString()),
}
```

### 3. Dashboard Integration
Version indicator ditampilkan di dashboard sebagai label kecil:
```typescript
<div className="flex items-center justify-center gap-2 py-2">
  <Info className="w-3 h-3 text-muted-foreground" />
  <span className="text-xs text-muted-foreground">
    v{versionInfo.version} • Build {formatBuildTime(versionInfo.buildTime)}
  </span>
</div>
```

## Usage

### Update Version
1. Update version di `package.json`:
```json
{
  "version": "1.0.1"
}
```

2. Build aplikasi:
```bash
npm run build
```

3. Version baru akan otomatis muncul di dashboard

### Version Format
- **Version**: Mengikuti semantic versioning (1.0.0)
- **Build Time**: Format Indonesia (DD/MM/YYYY HH:MM)
- **Display**: "v1.0.0 • Build 11/01/2026 15:30"

## Benefits
1. **Deployment Tracking**: Mudah melihat versi yang sedang running
2. **Debug Support**: Build timestamp membantu debugging
3. **User Awareness**: User tahu kapan ada update terbaru
4. **Automatic**: Tidak perlu manual update version display

## Future Enhancements
- Git commit hash integration
- Changelog modal
- Update notification
- Version comparison