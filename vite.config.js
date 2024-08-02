import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue';


export default defineConfig({
    esbuild: {
        supported: {
            'top-level-await': true //browsers can handle top-level-await features
        },
    },
    plugins: [vue()],
    server: {
        // Ensure correct MIME type
        mimeTypes: {
            'application/javascript': ['js', 'ts'],
        },
    },

})
