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

namespace HawkSearch\Proxy\Controller;

use HawkSearch\Proxy\Model\ConfigProvider;
use Magento\Framework\App\Action\Forward;

class LandingPageRouter implements \Magento\Framework\App\RouterInterface
{
    /**
     * @var \Magento\Framework\App\ActionFactory
     */
    protected $actionFactory;
    /**
     * @var \HawkSearch\Proxy\Helper\Data
     */
    private $helper;

    /**
     * @var ConfigProvider
     */
    private $proxyConfigProvider;

    /**
     * @param \Magento\Framework\App\ActionFactory $actionFactory
     * @param \HawkSearch\Proxy\Helper\Data $helper
     * @param ConfigProvider $proxyConfigProvider
     */
    public function __construct(
        \Magento\Framework\App\ActionFactory $actionFactory,
        \HawkSearch\Proxy\Helper\Data $helper,
        ConfigProvider $proxyConfigProvider
    ) {
        $this->actionFactory = $actionFactory;
        $this->helper = $helper;
        $this->proxyConfigProvider = $proxyConfigProvider;
    }

    public function match(\Magento\Framework\App\RequestInterface $request)
    {
        if (!$this->proxyConfigProvider->isLandingPageRouteEnabled()) {
            return false;
        }
        if (!$this->helper->getIsHawkManaged(trim($request->getPathInfo(), '/'))) {
            return false;
        }

        $request->setModuleName('hawkproxy')->setControllerName('landingPage')->setActionName('view');
        /*
         * We have match and now we will forward action
         */
        return $this->actionFactory->create(Forward::class);
    }
}
