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

namespace HawkSearch\Proxy\Model\Config\Backend;

use HawkSearch\Connector\Model\Config\ApiSettings as ApiSettingsProvider;
use HawkSearch\Proxy\Helper\Data;
use Laminas\Http\Client;
use Laminas\Http\Exception\RuntimeException;
use Laminas\Http\Headers;
use Laminas\Http\Request as HttpRequest;
use Magento\Framework\App\Cache\TypeListInterface;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\App\Config\Value;
use Magento\Framework\Data\Collection\AbstractDb;
use Magento\Framework\DataObject;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\Model\Context;
use Magento\Framework\Model\ResourceModel\AbstractResource;
use Magento\Framework\Registry;

class ShowTypeLabels extends Value
{
    /**
     * @var Data
     */
    private $helper;

    /**
     * @var ApiSettingsProvider
     */
    private $apiSettingsProvider;

    /**
     * ShowTypeLabels constructor.
     * @param Data $helper
     * @param Context $context
     * @param Registry $registry
     * @param ScopeConfigInterface $config
     * @param TypeListInterface $cacheTypeList
     * @param ApiSettingsProvider $apiSettingsProvider
     * @param AbstractResource|null $resource
     * @param AbstractDb|null $resourceCollection
     * @param array $data
     */
    public function __construct(
        Data $helper,
        Context $context,
        Registry $registry,
        ScopeConfigInterface $config,
        TypeListInterface $cacheTypeList,
        ApiSettingsProvider $apiSettingsProvider,
        ?AbstractResource $resource = null,
        ?AbstractDb $resourceCollection = null,
        array $data = []
    ) {
        parent::__construct($context, $registry, $config, $cacheTypeList, $resource, $resourceCollection, $data);
        $this->helper = $helper;
        $this->apiSettingsProvider = $apiSettingsProvider;
    }

    /**
     * @return ShowTypeLabels
     * @throws NoSuchEntityException
     * @throws RuntimeException
     */
    public function afterLoad()
    {
        if ($this->getValue() === null) {
            //determine state from hawksearch
            $field = $this->getFieldByName('it');
            if ($field->hasData()
                && $field->getData('DoNotStore') == false
                && $field->getData('IsOutput') == true
            ) {
                $this->setValue(1);
            }
        }
        return parent::afterLoad();
    }

    /**
     * @return ShowTypeLabels
     * @throws NoSuchEntityException
     * @throws RuntimeException
     */
    public function beforeSave()
    {
        if ($this->isValueChanged()) {
            if ($this->getValue()) {
                $res = $this->activateTypeInResult();
            } else {
                $res = $this->deactivateTypeInResult();
            }
            if (!$res) {
                $this->setValue($this->getOldValue());
            }
        }

        return parent::beforeSave();
    }

    /**
     * @return string
     * @throws NoSuchEntityException
     * @throws RuntimeException
     */
    private function activateTypeInResult()
    {
        $field = $this->getFieldByName('it');
        if ($field->hasData()) {
            $field->setData('DoNotStore', false);
            $field->setData('IsOutput', true);
            return $this->updateField($field);
        }
        return false;
    }

    /**
     * @return string
     * @throws NoSuchEntityException
     * @throws RuntimeException
     */
    private function deactivateTypeInResult()
    {
        $field = $this->getFieldByName('it');
        if ($field->hasData()) {
            $field->setData('DoNotStore', true);
            $field->setData('IsOutput', false);
            return $this->updateField($field);
        }
        return false;
    }

    /**
     * @param string $field
     * @return DataObject
     * @throws RuntimeException
     */
    private function getFieldByName($field)
    {
        $res = $this->apiGetCall('Field', ['fieldName' => $field]);
        $dataObject = new DataObject();
        if ($res['code'] == 200) {
            $it = $res['object'];
            if ($it) {
                $dataObject = new DataObject($it);
            }
        }
        return $dataObject;
    }

    /**
     * @param DataObject $field
     * @return bool
     * @throws NoSuchEntityException
     * @throws RuntimeException
     */
    private function updateField(DataObject $field)
    {
        if ($field->hasData() && $field->getData('SyncGuid')) {
            $res = $this->apiPutCall('Field/' . $field->getData('FieldId'), json_encode($field->getData()));
            if ($res['code'] == 200) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param $path
     * @param $args
     * @return array
     * @throws RuntimeException
     */
    private function apiGetCall($path, $args)
    {
        $client = new Client();
        $client->setUri($this->helper->getApiUrl() . $path . '?' . http_build_query($args));
        $client->setMethod(HttpRequest::METHOD_GET);
        $headers = new Headers();
        $headers->addHeaderLine('X-HawkSearch-ApiKey', $this->apiSettingsProvider->getApiKey());
        $headers->addHeaderLine('Accept', 'application/json');
        $client->setHeaders($headers);

        $response = $client->send();
        return [
            'code' => $response->getStatusCode(),
            'object' => json_decode((string) $response->getBody(), true)
        ];
    }

    /**
     * @param $path
     * @param $body
     * @return array
     * @throws RuntimeException
     */
    private function apiPutCall($path, $body)
    {
        $client = new Client();
        $client->setUri($this->helper->getApiUrl() . $path . '?');
        $client->setMethod(HttpRequest::METHOD_PUT);
        $headers = new Headers();
        $headers->addHeaderLine('X-HawkSearch-ApiKey', $this->apiSettingsProvider->getApiKey());
        $headers->addHeaderLine('Accept', 'application/json');
        $client->setHeaders($headers);
        $client->setEncType('application/json');
        $client->setRawBody($body);

        $response = $client->send();
        return [
            'code' => $response->getStatusCode(),
            'object' => json_decode((string) $response->getBody())
        ];
    }
}
