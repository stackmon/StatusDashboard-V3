import { ScaleTelekomFooter, ScaleTelekomFooterContent } from "@telekom/scale-components-react";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function PageFooter() {
  return (
    <ScaleTelekomFooter slot="footer" type="minimal" class="mt-auto pt-8" data-mode="dark">
      <ScaleTelekomFooterContent>
        <span slot="notice"> © Deutsche Telekom AG </span>
        <ul slot="navigation">
          <li>
            <a href="https://open-telekom-cloud.com/en/imprint">Imprint</a>
          </li>
          <li>
            <a href="https://open-telekom-cloud.com/en/data-protection">Data privacy</a>
          </li>
          <li>
            <a href="https://open-telekom-cloud.com/en/disclaimer-of-liability">Disclaimer of liability</a>
          </li>
          <li>
            <a href="https://open-telekom-cloud.com/en/contact">Contact</a>
          </li>
        </ul>
      </ScaleTelekomFooterContent>
    </ScaleTelekomFooter>
  );
}
