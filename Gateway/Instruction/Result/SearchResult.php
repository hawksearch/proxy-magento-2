<?php
/**
 *  Copyright (c) 2020 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 *  IN THE SOFTWARE.
 */
declare(strict_types=1);

namespace HawkSearch\Proxy\Gateway\Instruction\Result;

use HawkSearch\Connector\Gateway\Helper\HttpResponseReader;
use HawkSearch\Connector\Gateway\Instruction\ResultInterface;
use HawkSearch\Proxy\Api\Data\SearchResultResponseInterface;
use HawkSearch\Proxy\Api\Data\SearchResultResponseInterfaceFactory;
use Magento\Framework\Api\DataObjectHelper;

class SearchResult implements ResultInterface
{
    /**
     * @var array
     */
    private $result;

    /**
     * @var SearchResultResponseInterfaceFactory
     */
    private $resultResponseFactory;

    /**
     * @var DataObjectHelper
     */
    private $dataObjectHelper;

    /**
     * @var HttpResponseReader
     */
    private $httpResponseReader;

    /**
     * @param SearchResultResponseInterfaceFactory $resultResponseFactory
     * @param DataObjectHelper $dataObjectHelper
     * @param array $result
     */
    public function __construct(
        SearchResultResponseInterfaceFactory $resultResponseFactory,
        DataObjectHelper $dataObjectHelper,
        HttpResponseReader $httpResponseReader,
        array $result = []
    ) {
        $this->result = $result;
        $this->resultResponseFactory = $resultResponseFactory;
        $this->dataObjectHelper = $dataObjectHelper;
        $this->httpResponseReader = $httpResponseReader;
    }

    /**
     * Returns result interpretation
     *
     * @return SearchResultResponseInterface
     */
    public function get()
    {
        $responseData = $this->httpResponseReader->readResponseData($this->result);
        $responseData[SearchResultResponseInterface::RESPONSE_DATA] = $responseData['Data'];
        unset($responseData['Data']);

        $resultResponseDataObject = $this->resultResponseFactory->create();
        $this->dataObjectHelper->populateWithArray(
            $resultResponseDataObject,
            $responseData,
            SearchResultResponseInterface::class
        );
        return $resultResponseDataObject;
    }
}
