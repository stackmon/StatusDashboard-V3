import { useMount } from "ahooks";
import { ReactNode, createContext, useContext, useState } from "react";

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
function combine(paths: readonly any[]): string {
  const p = paths
    .filter(x => x)
    .map(x => x!.toString().replace(/^\/+/, ""))
    .join("/");

  return `/${p}`;
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
interface IRouter {
  Paths: readonly string[],
  Search: URLSearchParams,
  readonly Put: (search: URLSearchParams) => void,
  readonly Nav: (...paths: readonly any[]) => void,
  readonly Rep: (...paths: readonly any[]) => void,
  readonly Reload: (...paths: readonly any[]) => void,
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
const Router = createContext({} as IRouter);

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
export function useRouter() {
  return useContext(Router);
}

/**
 * @author Aloento
 * @since 1.0.0
 * @version 1.0.0
 */
export function BrowserRouter({ children }: { children: ReactNode }): ReactNode {
  const [router, setRouter] = useState<IRouter>(() => ({
    Paths: location.pathname.split("/").filter(x => x),
    Search: new URLSearchParams(location.search),
    Put: put,
    Nav: (...p) => nav(combine(p)),
    Rep: (...p) => rep(combine(p)),
    Reload: (...p) => reload(p),
  }));

  function put(search: URLSearchParams) {
    history.replaceState(null, "", `${location.pathname}${search.size ? "?" : ""}${search.toString()}`);
    router.Search = new URLSearchParams(search);
    setRouter({ ...router });
  }

  function update(path: string) {
    router.Paths = path.split("/").filter(x => x);
    router.Search = new URLSearchParams(location.search);
    setRouter({ ...router });
  }

  function nav(path: string) {
    history.pushState(null, "", path);
    update(path);
  }

  function rep(path: string) {
    history.replaceState(null, "", path);
    update(path);
  }

  function reload(paths: readonly string[]) {
    history.replaceState(null, "", "/Reload");
    update("/Reload");

    setTimeout(() => {
      const path = paths.length ? combine(paths) : location.pathname;
      history.pushState(null, "", path);
      update(path);
    }, 100);
  }

  useMount(() => {
    if (location.pathname === "/")
      if (location.search.startsWith("?/"))
        rep(location.search.substring(2));

    addEventListener("click", e => {
      const target = (e.target as HTMLElement)?.closest("a");

      if (target) {
        if (target.origin !== location.origin) {
          target.target = "_blank";
          return;
        }

        e.preventDefault();
        nav(target.pathname);
      }
    });

    addEventListener("popstate", e => {
      e.preventDefault();
      update(location.pathname);
    });
  });

  return (
    <Router.Provider value={router}>
      {children}
    </Router.Provider>
  );
}
