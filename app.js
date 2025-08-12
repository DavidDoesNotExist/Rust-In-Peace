import init, { ObitGenerator } from './pkg/obit_generator.js';

const { createApp, ref, reactive, computed, onMounted } = Vue;
const { jsPDF } = window.jspdf;

const app = createApp({
    setup() {
        const formData = reactive({
            name: '',
            birthDate: '',
            deathDate: '',
            biography: '',
            epitaph: '',
            noxxEdition: false
        });
        
        const rustInitialized = ref(false);
        const rustGenerator = ref(null);
        const preview = ref(null);
        
        onMounted(async () => {
            try {
                await init();
                rustGenerator.value = new ObitGenerator();
                rustInitialized.value = true;
            } catch (error) {
                console.error('WASM initialization failed:', error);
            }
        });
        
        const rustGeneratedAnnouncement = computed(() => {
            if (!rustGenerator.value || !rustInitialized.value) {
                return "Initializing Rust engine...";
            }
            return rustGenerator.value.generate_death_announcement(formData.name);
        });
        
        const formatDate = (dateString) => {
            if (!dateString) return '';
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('en-US', options);
        };
        
        const generatePdf = async () => {
            if (!rustInitialized.value) return;
            
            try {
                const canvas = await html2canvas(preview.value, {
                    scale: 2,
                    backgroundColor: '#f0e6d2',
                    useCORS: true
                });
                
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });
                
                const imgWidth = 190;
                const imgHeight = canvas.height * imgWidth / canvas.width;
                
                pdf.addImage(canvas, 'JPEG', 10, 10, imgWidth, imgHeight);
                pdf.save(`RustInPeace_Obituary_${formData.name || 'Unknown'}.pdf`);
            } catch (error) {
                console.error('PDF generation failed:', error);
                alert('Failed to generate PDF. Please try again.');
            }
        };
        
        const resetForm = () => {
            formData.name = '';
            formData.birthDate = '';
            formData.deathDate = '';
            formData.biography = '';
            formData.epitaph = '';
            formData.noxxEdition = false;
        };
        
        return {
            formData,
            rustInitialized,
            rustGeneratedAnnouncement,
            preview,
            formatDate,
            generatePdf,
            resetForm
        };
    }
});

app.mount('#app');
