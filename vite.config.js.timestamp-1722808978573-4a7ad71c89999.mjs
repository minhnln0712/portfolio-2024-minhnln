// vite.config.js
import { defineConfig } from "file:///D:/Project/Game%20Dev/portfolio-2024-minhnln/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/Project/Game%20Dev/portfolio-2024-minhnln/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import topLevelAwait from "file:///D:/Project/Game%20Dev/portfolio-2024-minhnln/node_modules/vite-plugin-top-level-await/exports/import.mjs";
var vite_config_default = defineConfig({
  esbuild: {
    supported: {
      "top-level-await": true
      //browsers can handle top-level-await features
    }
  },
  plugins: [vue(), topLevelAwait()],
  server: {
    // Ensure correct MIME type
    mimeTypes: {
      "application/javascript": ["js", "ts"]
    },
    proxy: {
      "/api": "http://localhost:5000"
    }
  },
  base: "./"
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQcm9qZWN0XFxcXEdhbWUgRGV2XFxcXHBvcnRmb2xpby0yMDI0LW1pbmhubG5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFByb2plY3RcXFxcR2FtZSBEZXZcXFxccG9ydGZvbGlvLTIwMjQtbWluaG5sblxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUHJvamVjdC9HYW1lJTIwRGV2L3BvcnRmb2xpby0yMDI0LW1pbmhubG4vdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XHJcbmltcG9ydCB0b3BMZXZlbEF3YWl0IGZyb20gJ3ZpdGUtcGx1Z2luLXRvcC1sZXZlbC1hd2FpdCdcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gICAgZXNidWlsZDoge1xyXG4gICAgICAgIHN1cHBvcnRlZDoge1xyXG4gICAgICAgICAgICAndG9wLWxldmVsLWF3YWl0JzogdHJ1ZSAvL2Jyb3dzZXJzIGNhbiBoYW5kbGUgdG9wLWxldmVsLWF3YWl0IGZlYXR1cmVzXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBwbHVnaW5zOiBbdnVlKCksIHRvcExldmVsQXdhaXQoKV0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgICAvLyBFbnN1cmUgY29ycmVjdCBNSU1FIHR5cGVcclxuICAgICAgICBtaW1lVHlwZXM6IHtcclxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnOiBbJ2pzJywgJ3RzJ10sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwcm94eToge1xyXG4gICAgICAgICAgICAnL2FwaSc6ICdodHRwOi8vbG9jYWxob3N0OjUwMDAnXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGJhc2U6ICcuLycsXHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMFQsU0FBUyxvQkFBb0I7QUFDdlYsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sbUJBQW1CO0FBRzFCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLFNBQVM7QUFBQSxJQUNMLFdBQVc7QUFBQSxNQUNQLG1CQUFtQjtBQUFBO0FBQUEsSUFDdkI7QUFBQSxFQUNKO0FBQUEsRUFDQSxTQUFTLENBQUMsSUFBSSxHQUFHLGNBQWMsQ0FBQztBQUFBLEVBQ2hDLFFBQVE7QUFBQTtBQUFBLElBRUosV0FBVztBQUFBLE1BQ1AsMEJBQTBCLENBQUMsTUFBTSxJQUFJO0FBQUEsSUFDekM7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNILFFBQVE7QUFBQSxJQUNaO0FBQUEsRUFDSjtBQUFBLEVBQ0EsTUFBTTtBQUNWLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
