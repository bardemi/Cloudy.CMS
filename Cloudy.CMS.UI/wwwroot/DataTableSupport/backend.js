﻿import urlFetcher from "../url-fetcher";

/* BACKEND */

class Backend {
    constructor(arg) {
        if (typeof arg == 'string') {
            this.name = arg;
        }
        if (arg instanceof Array) {
            this.data = arg;
        }
    }

    async load(query) {
        if (this.data) {
            var data = [...this.data];

            var direction = query.sortDirection == 'ascending' ? 1 : -1;

            if (query.sortBy) {
                data.sort((a, b) => {
                    a = a[query.sortBy];
                    b = b[query.sortBy];

                    if (!a) {
                        return -1 * direction;
                    }

                    if (!b) {
                        return 1 * direction;
                    }

                    if (typeof a == 'string' && typeof b == 'string') {
                        return a.localeCompare(b, 'en', { sensitivity: 'base' }) * direction;
                    }

                    return (a > b) * direction;
                });
            }

            return Promise.resolve({
                items: [...data],
                pageCount: 1,
                pageSize: data.length,
                totalMatching: data.length,
            });
        }

        var sort = query.sortBy ? `&sortby=${query.sortBy}&sortdirection=${query.sortDirection}` : '';
        return await urlFetcher.fetch(`Backend/GetAll?provider=${this.name}&page=${query.page}${sort}`, { credentials: 'include' }, `Could not get data from datatable backend ${this.name}`);
    }
}

export default Backend;