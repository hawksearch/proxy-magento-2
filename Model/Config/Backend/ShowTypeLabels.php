<?php
/**
 * Created by PhpStorm.
 * User: dev
 * Date: 12/7/18
 * Time: 2:42 PM
 */

namespace HawkSearch\Proxy\Model\Config\Backend;


use Magento\Framework\Message\ManagerInterface;

class ShowTypeLabels extends \Magento\Framework\App\Config\Value
{
    /**
     * @var \HawkSearch\Proxy\Helper\Data
     */
    private $helper;
    /**
     * @var ManagerInterface
     */
    private $messageManager;

    public function __construct(
        \HawkSearch\Proxy\Helper\Data $helper,
        \Magento\Framework\Message\ManagerInterface $messageManager,
        \Magento\Framework\Model\Context $context,
        \Magento\Framework\Registry $registry,
        \Magento\Framework\App\Config\ScopeConfigInterface $config,
        \Magento\Framework\App\Cache\TypeListInterface $cacheTypeList,
        \Magento\Framework\Model\ResourceModel\AbstractResource $resource = null,
        \Magento\Framework\Data\Collection\AbstractDb $resourceCollection = null,
        array $data = []
    )
    {
        parent::__construct($context, $registry, $config, $cacheTypeList, $resource, $resourceCollection, $data);
        $this->helper = $helper;
        $this->messageManager = $messageManager;
    }

    public function afterLoad()
    {
        if ($this->getValue() === null) {
            //determine state from hawksearch
            $res = $this->apiGetCall('Field', ['fieldName' => 'it']);
            if ($res['code'] == 200) {
                $it = $res['object'];
                if ($it->DoNotStore == false && $it->IsOutput == true) {
                    $this->setValue(1);
                }
            }
        }
        return parent::afterLoad();
    }

    public function beforeSave()
    {
        if ($this->getValue() == 1) {
            $res = $this->activateTypeInResult();
        } else {
            $res = $this->deactivateTypeInResult();
        }
        if ($res != 'OK') {
            $this->setValue($this->getOldValue());
            // need to add a message to the page that the
        }
        return parent::beforeSave();
    }

    public function activateTypeInResult()
    {
        $res = $this->apiGetCall('Field', ['fieldName' => 'it']);
        if ($res['code'] == 200) {
            $it = $res['object'];
            $it->DoNotStore = false;
            $it->IsOutput = true;
            $res = $this->apiPutCall('Field/' . $it->SyncGuid, json_encode($it));
            if ($res['code'] == 200) {
                return 'OK';
            } else {
                return 'error';
            }
        } else {
            return 'error';
        }
    }

    public function deactivateTypeInResult()
    {
        $res = $this->apiGetCall('Field', ['fieldName' => 'it']);
        if ($res['code'] == 200) {
            $it = $res['object'];
            $it->DoNotStore = true;
            $it->IsOutput = false;
            $res = $this->apiPutCall('Field/' . $it->SyncGuid, json_encode($it));
            if ($res['code'] == 200) {
                return 'OK';
            } else {
                return 'error';
            }
        } else {
            return 'error';
        }
    }

    private function apiGetCall($path, $args)
    {
        $client = new \Zend_Http_Client();
        $client->setUri($this->helper->getApiUrl() . $path . '?' . http_build_query($args));
        $client->setMethod(\Zend_Http_Client::GET);
        $client->setHeaders('X-HawkSearch-ApiKey', $this->helper->getApiKey());
        $client->setHeaders('Accept', 'application/json');

        $response = $client->request();
        return ['code' => $response->getStatus(), 'object' => json_decode($response->getBody())];
    }

    private function apiPutCall($path, $body)
    {
        $client = new \Zend_Http_Client();
        $client->setUri($this->helper->getApiUrl() . $path . '?');
        $client->setMethod(\Zend_Http_Client::PUT);
        $client->setHeaders('X-HawkSearch-ApiKey', $this->helper->getApiKey());
        $client->setHeaders('Accept', 'application/json');
        $client->setHeaders('Content-Type', 'application/json');
        $client->setRawData($body);

        $response = $client->request();
        return ['code' => $response->getStatus(), 'object' => json_decode($response->getBody())];
    }
}