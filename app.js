import init, { ObitGenerator } from './obit_generator.js';

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
                console.error('Failed to initialize Rust module:', error);
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
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', options);
        };
        
        const generatePdf = async () => {
            if (!rustInitialized.value) return;
            
            try {
                const element = preview.value;
                const canvas = await html2canvas(element, {
                    scale: 2,
                    backgroundColor: '#f0e6d2',
                    useCORS: true
                });
                
                const imgData = canvas.toDataURL('image/jpeg', 0.92);
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });
                
                const imgWidth = 190;
                const pageHeight = 297;
                const imgHeight = canvas.height * imgWidth / canvas.width;
                let heightLeft = imgHeight;
                let position = 5;
                
                pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
                
                pdf.save(`RustInPeace_Obituary_${formData.name || 'Unknown'}.pdf`);
            } catch (error) {
                console.error('Error generating PDF:', error);
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
