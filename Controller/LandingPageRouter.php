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

use HawkSearch\Proxy\Helper\Data;
use HawkSearch\Proxy\Model\Config\Proxy as ProxyConfigProvider;
use Magento\Framework\App\Action\Forward;
use Magento\Framework\App\ActionFactory;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\App\RouterInterface;

class LandingPageRouter implements RouterInterface
{
    /**
     * @var ActionFactory
     */
    protected $actionFactory;

    /**
     * @var Data
     */
    private $helper;

    /**
     * @var ProxyConfigProvider
     */
    private $proxyConfigProvider;

    /**
     * @param ActionFactory $actionFactory
     * @param Data $helper
     * @param ProxyConfigProvider $proxyConfigProvider
     */
    public function __construct(
        ActionFactory $actionFactory,
        Data $helper,
        ProxyConfigProvider $proxyConfigProvider
    )
    {
        $this->actionFactory = $actionFactory;
        $this->helper = $helper;
        $this->proxyConfigProvider = $proxyConfigProvider;
    }

    /**
     * @inheritDoc
     */
    public function match(RequestInterface $request)
    {
        if (!$this->proxyConfigProvider->isLandingPageRouteEnabled()) {
            return false;
        }
        if (!$this->helper->getIsHawkManaged($request->getPathInfo())) {
            return false;
        }

        $request->setModuleName('hawkproxy')->setControllerName('landingPage')->setActionName('view');
        /*
         * We have match and now we will forward action
         */
        return $this->actionFactory->create(Forward::class);
    }
}
