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
use Magento\Config\Model\Config\Backend\Serialized\ArraySerialized;
use Magento\Framework\App\Cache\TypeListInterface;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\Data\Collection\AbstractDb;
use Magento\Framework\Model\Context;
use Magento\Framework\Model\ResourceModel\AbstractResource;
use Magento\Framework\Registry;
use Magento\Framework\Serialize\Serializer\Json;
use Zend_Http_Client;
use Zend_Http_Client_Exception;

class TypeLabel extends ArraySerialized
{
    /**
     * @var ProxyHelper
     */
    private $proxyHelper;

    /**
     * TypeLabel constructor.
     * @param ProxyHelper $proxyHelper
     * @param Context $context
     * @param Registry $registry
     * @param ScopeConfigInterface $config
     * @param TypeListInterface $cacheTypeList
     * @param AbstractResource|null $resource
     * @param AbstractDb|null $resourceCollection
     * @param array $data
     * @param Json|null $serializer
     */
    public function __construct(
        ProxyHelper $proxyHelper,
        Context $context,
        Registry $registry,
        ScopeConfigInterface $config,
        TypeListInterface $cacheTypeList,
        AbstractResource $resource = null,
        AbstractDb $resourceCollection = null,
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
    }

    /**
     * @inheritDoc
     * @throws Zend_Http_Client_Exception
     */
    protected function _afterLoad()
    {
        parent::_afterLoad();
        if (!$this->getValue() || count($this->getValue()) == 0) {

            $client = new Zend_Http_Client();
            $client->setUri(
                $this->proxyHelper->getSearchUrl(
                    '',
                    ['q' => '', 'hawktabs' => 'json', 'it' => 'all', 'output' => 'custom']
                ),
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
                //@TODO expected parameter is 'string'
                $this->setValue($value);
            }
        }
    }
}
