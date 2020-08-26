<?php
/**
 * Copyright (c) 2020 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

namespace HawkSearch\Proxy\Plugin;

use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Store\App\Response\Redirect as ResponseRedirect;

class StoreRedirect extends ResponseRedirect
{
    /**
     * @param $subject
     * @param $result
     * @return mixed
     * @throws NoSuchEntityException
     */
    public function afterGetRefererUrl($subject, $result)
    {
        $baseurl = $this->_storeManager->getStore()->getBaseUrl();
        if (substr($result, strlen($baseurl), 9) == 'hawkproxy') {
            return $this->_request->getServer('HTTP_REFERER');
        }
        return $result;
    }
}
