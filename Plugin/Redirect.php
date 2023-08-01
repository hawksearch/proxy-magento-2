<?php
/**
 * Copyright (c) 2023 Hawksearch (www.hawksearch.com) - All Rights Reserved
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

use Magento\Framework\App;
use Magento\Framework\App\Request\Http;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\UrlInterface;
use Magento\Framework\App\Response\RedirectInterface;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Framework\Controller\Result\Redirect as ControllerRedirect;

class Redirect extends ControllerRedirect
{
    /**
     * @var Http
     */
    private $request;
    /**
     * @var StoreManagerInterface
     */
    private $storeManager;

    /**
     * Redirect constructor.
     * @param Http $request
     * @param StoreManagerInterface $storeManager
     * @param RedirectInterface $redirect
     * @param UrlInterface $urlBuilder
     */
    public function __construct(
        Http $request,
        StoreManagerInterface $storeManager,
        RedirectInterface $redirect,
        UrlInterface $urlBuilder
    ) {
        parent::__construct($redirect, $urlBuilder);
        $this->request = $request;
        $this->storeManager = $storeManager;
    }

    /**
     * @param ControllerRedirect $subject
     * @param ControllerRedirect $result
     * @return ControllerRedirect
     * @throws NoSuchEntityException
     */
    public function afterSetRefererOrBaseUrl(ControllerRedirect $subject, ControllerRedirect $result)
    {
        $baseurl = $this->storeManager->getStore()->getBaseUrl();
        if (substr((string)$result->url, strlen((string) $baseurl), 9) == 'hawkproxy') {
            $result->setUrl($this->request->getServer('HTTP_REFERER'));
        }
        return $result;
    }
}
