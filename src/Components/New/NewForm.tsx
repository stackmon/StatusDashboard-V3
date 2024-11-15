/**
 * @author Aloento
 * @since 1.0.0
 * @version 0.1.0
 */
export function NewForm() {
  return (
    <form
      className="flex flex-col gap-y-6 rounded-md bg-white px-8 py-7 shadow-md"
      onSubmit={(e) => { e.preventDefault() }}
    >

    </form>
  )
}
