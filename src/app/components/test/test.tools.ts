
export class TestTools {

    static count = {
        test: 0,
        success: 0,
        failure: 0
    };

    constructor() {

    }
    /**
     *
     * @param params
     */
    success(...params) {
        TestTools.count.test++;
        TestTools.count.success++;
        const str = `Success: [${TestTools.count.success}/${TestTools.count.test}]: `;
        // params.unshift( str );
        // params = [str, ...params];
        // if (params && params.length) {
        //   for (const p of params) {
        //     console.log(p);
        //   }
        // }
        // params.unshift( str );
        console.log(str, ...params);
    }
    /**
     *
     * @param params
     */
    failure(...params) {
        TestTools.count.test++;
        TestTools.count.failure++;
        console.error(`Failure: [${TestTools.count.failure}/${TestTools.count.test}]: `);
        if (params && params.length) {
            for (const p of params) {
                console.error(p);
            }
        }
    }
    /**
     * Calls success or failure based on `b`.
     * @param b `Boolean` or `condition`.
     * @param params some useful information that can give developer a clue to the problem.
     */
    test(b, ...params) {
        if (b) {
            this.success(params);
        } else {
            this.failure(params);
        }
    }
}

