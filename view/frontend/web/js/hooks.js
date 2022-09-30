/**
 * Copyright (c) 2021 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

HawkSearchHooks = {
    /**
     * Hook queue
     */
    queue : {},

    /**
     *
     * @param name Hook name
     * @param callback callback function
     */
    register : function (name, callback) {
        if (!this.queue[name]) {
            this.queue[name] = [];
        }
        this.queue[name].push(callback);
    },

    /**
     * Execute hook
     * @param name Hook name
     * @param inputData Original data. It might me modified by the callback function
     * @param params Parameters we are passing to hook callback function
     */
    trigger: function (name, inputData, ...params) {
        if (this.queue[name]) {
            this.queue[name].forEach(function (callback) {
                if (Array.isArray(inputData)) {
                    inputData = [inputData];
                }
                var callbackParams = [].concat(inputData).concat(params);
                inputData = callback(...callbackParams);
            });
        }
        return inputData;
    }
};
