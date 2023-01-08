import { html, useEffect, useState } from "../preact-htm/standalone.module.js";
import SearchBox from "./search-box.js";

export default ({ contentType, simpleKey, value, onSelect }) => {
  const [pageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState();
  const [pages, setPages] = useState();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState();
  const [filter, setFilter] = useState('');
  const [error, setError] = useState();
  const [retryError, setRetryError] = useState(0);

  useEffect(function () {
    (async () => {
      var response = await fetch(
        `/Admin/api/controls/select/list?contentType=${contentType}&filter=${filter}&pageSize=${pageSize}&page=${page}&simpleKey=${simpleKey}`,
        {
          credentials: 'include'
        }
      );

      if (!response.ok) {
        setError({ response, body: await response.text() });
        return;
      }

      var json = await response.json();

      setLoading(false);
      setData(json);
      const pageCount = Math.max(1, Math.ceil(json.totalCount / pageSize));
      setPageCount(pageCount);
      setPages([...Array(pageCount)]);
      setPage(Math.min(pageCount, page)); // if filtered results have less pages than what is on the current page
    })();
  }, [page, pageSize, filter, retryError]);

  if (error) {
    return html`<>
      <div class="alert alert-primary mx-2">
        <p>There was an error (<code>${error.response.status}${error.response.statusText ? " " + error.response.statusText : ""}</code>) loading your list${error.body ? ":" : "."}</p>
        ${error.body ? html`<small><pre>${error.body}</pre></small>` : ""}
        <p class="mb-0"><button class="btn btn-primary" onClick=${() => { setError(null); setTimeout(() => setRetryError(retryError + 1), 500); }}>Reload</button></p>
      </div>
    </>`;
  }

  if (loading) {
    return html`Loading ...`;
  }

  return html`
    <div class="mx-2">
      <${SearchBox} small=${true} callback=${value => setFilter(value)} />
    </div>
    <div>
      ${data.items.map(item =>
        html`<div><a class=${"dropdown-item" + (item.reference == value ? " active" : "")} onClick=${() => { onSelect(item.reference == value ? null : item); }} tabIndex="0">${item.name}</a></div>`
      )}
    </div>
    <div>
      ${[...new Array(pageSize - data.items.length)].map(() => html`<div><a class="dropdown-item disabled">&nbsp;</a></div>`)}
    </div>
    <nav>
      <ul class="pagination pagination-sm justify-content-center m-0 mt-2">
        <li class="page-item"><a class=${"page-link" + (page == 1 ? " disabled" : "")} onClick=${() => setPage(Math.max(1, page - 1))} title="Previous">&laquo;</a></li>
        ${pages.map((_, i) => html`<li class=${"page-item" + (page == i + 1 ? " active" : "")}><a class="page-link" onClick=${() => setPage(i + 1)}>${i + 1}</a></li>`)}
        <li class="page-item"><a class=${"page-link" + (page == pageCount ? " disabled" : "")} onClick=${() => setPage(Math.min(pageCount, page + 1))} title="Next">&raquo;</a></li>
      </ul>
    </nav>
  `;
};