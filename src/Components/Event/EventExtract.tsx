import { ScaleButton, ScaleHelperText, ScaleIconActionExport, ScaleModal, ScaleTable } from "@telekom/scale-components-react";
import { useBoolean } from "ahooks";
import { chain } from "lodash";
import { Models } from "~/Services/Status.Models";
import { useEventExtract } from "./useEventExtract";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function EventExtract({ Event }: { Event: Models.IEvent }) {
  const { services, setServices, valServices, OnSubmit, Loading } = useEventExtract(Event);
  const [open, { setTrue, setFalse }] = useBoolean();

  return <>
    <ScaleButton onClick={setTrue} size="small" variant="secondary">
      <ScaleIconActionExport />
      Extract
    </ScaleButton>

    <ScaleModal
      heading="Extract Event"
      opened={open}
      omitCloseButton
      size="small"
      class="absolute"
      onScale-before-close={(e) => e.preventDefault()}
    >
      <form
        className="flex flex-col gap-y-6"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          OnSubmit().then((ok) => ok && setFalse());
        }}>
        <ScaleTable>
          <div className="max-h-96 overflow-auto">
            <table>
              <thead className="sticky">
                <tr>
                  <th />
                  <th>Service Name</th>
                  <th>Region</th>
                </tr>
              </thead>

              <tbody>
                {chain([...Event.RegionServices])
                  .orderBy(x => x.Service.Name)
                  .map((x, i) =>
                    <tr key={i}>
                      <td>
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setServices((curr) => {
                              if (checked) {
                                return [...curr, x];
                              }

                              return curr.filter(s => s !== x);
                            })
                          }}
                        />
                      </td>

                      <td>{x.Service.Name}</td>
                      <td>{x.Region.Name}</td>
                    </tr>)
                  .value()}
              </tbody>
            </table>
          </div>

          <ScaleHelperText
            variant={valServices ? "danger" : "informational"}
            helperText={valServices || `Selected ${services.length} services`}
          />
        </ScaleTable>

        <div className="flex gap-x-3 self-end">
          <ScaleButton onClick={setFalse} variant="secondary" type="button">
            Cancel
          </ScaleButton>

          <ScaleButton type="submit" disabled={Loading}>
            Submit
          </ScaleButton>
        </div>
      </form>
    </ScaleModal>
  </>;
}
