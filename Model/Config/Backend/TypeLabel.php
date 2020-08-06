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

namespace HawkSearch\Proxy\Model\Config\Backend;

use HawkSearch\Proxy\Helper\Data as ProxyHelper;
use HawkSearch\Proxy\Model\ConfigProvider as ProxyConfigProvider;
use Magento\Framework\Serialize\Serializer\Json;

class TypeLabel extends \Magento\Config\Model\Config\Backend\Serialized\ArraySerialized
{
    /**
     * @var \HawkSearch\Proxy\Helper\DataFactory
     */
    private $proxyHelper;

    /**
     * @var ProxyConfigProvider
     */
    private $proxyConfigProvider;

    /**
     * TypeLabel constructor.
     * @param ProxyHelper $proxyHelper
     * @param \Magento\Framework\Model\Context $context
     * @param \Magento\Framework\Registry $registry
     * @param \Magento\Framework\App\Config\ScopeConfigInterface $config
     * @param \Magento\Framework\App\Cache\TypeListInterface $cacheTypeList
     * @param ProxyConfigProvider $proxyConfigProvider
     * @param \Magento\Framework\Model\ResourceModel\AbstractResource|null $resource
     * @param \Magento\Framework\Data\Collection\AbstractDb|null $resourceCollection
     * @param array $data
     * @param Json|null $serializer
     */
    public function __construct(
        ProxyHelper $proxyHelper,
        \Magento\Framework\Model\Context $context,
        \Magento\Framework\Registry $registry,
        \Magento\Framework\App\Config\ScopeConfigInterface $config,
        \Magento\Framework\App\Cache\TypeListInterface $cacheTypeList,
        ProxyConfigProvider $proxyConfigProvider,
        \Magento\Framework\Model\ResourceModel\AbstractResource $resource = null,
        \Magento\Framework\Data\Collection\AbstractDb $resourceCollection = null,
        array $data = [],
        Json $serializer = null
    ) {
        parent::__construct(
            $context,
            $registry,
            $config,
            $cacheTypeList,
            $resource,
            $resourceCollection,
            $data,
            $serializer
        );
        $this->proxyHelper = $proxyHelper;
        $this->proxyConfigProvider = $proxyConfigProvider;
    }

    /**
     * @throws \Zend_Http_Client_Exception
     */
    protected function _afterLoad()
    {
        parent::_afterLoad();
        if (!$this->getValue() || count($this->getValue()) == 0) {

            $client = new \Zend_Http_Client();
            $client->setUri(
                $this->proxyConfigProvider->getHawkUrl() . '/?'
                . http_build_query(['q' => '', 'hawktabs' => 'json', 'it' => 'all', 'output' => 'custom'])
            );
            $response = $client->request();
            if ($response->getStatus() != 200) {
                return;
            }
            $result = json_decode($response->getBody());
            if (isset($result->Data) && isset($result->Data->Tabs)) {
                $tabs = json_decode($result->Data->Tabs);
                $value = [];
                foreach ($tabs->Tabs as $tab) {
                    if ($tab->Value == 'all') {
                        continue;
                    }
                    $bg = $this->proxyHelper->generateColor($tab->Value);
                    $fg = $this->proxyHelper->generateTextColor($bg);
                    $value['_' . $tab->Value] = [
                        'title' => $tab->Title,
                        'code' => $tab->Value,
                        'color' => $bg,
                        'textColor' => $fg
                    ];
                }
                $this->setValue($value);
            }
        }
    }
}
