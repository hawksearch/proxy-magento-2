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
declare(strict_types=1);

namespace HawkSearch\Proxy\Model\Provider\Response;

use HawkSearch\Connector\Gateway\InstructionException;
use HawkSearch\Proxy\Helper\Data as ProxyHelper;
use HawkSearch\Proxy\Model\Provider\ResponseProviderInterface;
use Magento\Framework\App\Action\Action;
use Magento\Framework\App\ActionFlag;
use Magento\Framework\App\ResponseInterface;
use Magento\Framework\Exception\NotFoundException;

class RuleRedirectProvider implements ResponseProviderInterface
{
    /**
     * @var ActionFlag
     */
    private $actionFlag;

    /**
     * @var ProxyHelper
     */
    private $proxyHelper;

    /**
     * RuleRedirectProvider constructor.
     * @param ActionFlag $actionFlag
     * @param ProxyHelper $proxyHelper
     */
    public function __construct(
        ActionFlag $actionFlag,
        ProxyHelper $proxyHelper
    ){
        $this->actionFlag = $actionFlag;
        $this->proxyHelper = $proxyHelper;
    }

    /**
     * Get redirect URL
     * @return string|null
     * @throws InstructionException
     * @throws NotFoundException
     */
    private function getUrl(): ?string
    {
        return $this->proxyHelper->getResultData()->getLocation();
    }

    /**
     * Use this redirect provider before action pre-dispatch
     * @inheritdoc
     */
    public function execute(?ResponseInterface $response = null)
    {
        if ($url = $this->getUrl()) {
            $this->actionFlag->set('', Action::FLAG_NO_DISPATCH, true);
            $response->setRedirect($url);
        }
    }
}
