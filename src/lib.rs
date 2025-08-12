use wasm_bindgen::prelude::*;
use rand::seq::SliceRandom;

#[wasm_bindgen]
pub struct ObitGenerator;

#[wasm_bindgen]
impl ObitGenerator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> ObitGenerator {
        // Set up better error handling for WASM
        #[cfg(target_arch = "wasm32")]
        std::panic::set_hook(Box::new(console_error_panic_hook::hook));
        
        ObitGenerator
    }

    pub fn generate_death_announcement(&self, name: &str) -> String {
        // Handle empty name case
        if name.trim().is_empty() {
            return "A soul has departed this realm, leaving memories behind.".into();
        }

        let phrases = [
            format!("The mortal coil has been shuffled off by {}, who now rests beyond the veil.", name),
            format!("{} has taken their final bow, exiting life's grand stage.", name),
            format!("We bid farewell to {}, whose journey through this realm has concluded.", name),
            format!("Death's cold embrace has claimed {}, leaving memories in its wake.", name),
            format!("{} has embarked on the ultimate journey, leaving earthly bonds behind.", name),
            format!("The final chapter has closed for {}, whose story now resides in memory.", name),
            format!("{} has slipped beyond the veil of mortality into eternal rest.", name),
            format!("With solemn hearts, we mark the departure of {} from this temporal plane.", name),
        ];

        // Get a random phrase safely
        let mut rng = rand::thread_rng();
        phrases.choose(&mut rng)
            .cloned()
            .unwrap_or_else(|| format!("{} has passed away.", name))
    }
}
